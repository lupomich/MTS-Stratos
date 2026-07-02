#!/usr/bin/env node
/**
 * test-real-drag.mjs
 * REAL UI test: physically drags the CCY column header OUT of the grid with the mouse,
 * exactly like a user removing a column. Captures page console logs, network PUTs,
 * column state, then logs out and back in to verify persistence.
 *
 * Usage: node scripts/test-real-drag.mjs [--headless]
 */

import { chromium } from 'playwright';
import { execFileSync } from 'child_process';

const BASE_URL  = process.env.BASE_URL || 'http://127.0.0.1:3002';
const TEST_USER = { username: 'col-test', password: 'ColTest123!' };
const HEADLESS  = process.argv.includes('--headless');

const sleep = ms => new Promise(r => setTimeout(r, ms));

function resetAllSessions() {
    try {
        execFileSync('docker', ['exec', 'mts-stratos-postgres', 'psql', '-U', 'stratos', '-d', 'stratos_db', '-c',
            "UPDATE users SET is_logged_in = false, active_session_id = NULL, active_session_at = NULL;"], { stdio: 'pipe' });
        execFileSync('docker', ['exec', 'mts-stratos-postgres', 'psql', '-U', 'stratos', '-d', 'stratos_db', '-c',
            "UPDATE user_sessions SET is_active = false WHERE is_active = true;"], { stdio: 'pipe' });
        execFileSync('docker', ['exec', 'mts-stratos-redis', 'sh', '-lc',
            "redis-cli --scan --pattern 'auth:online:*' | xargs -r redis-cli del >/dev/null"], { stdio: 'pipe' });
    } catch (e) { console.warn('session reset warn:', e.message); }
}

function resetPrefs() {
    // Seed a FULL columnOrder (all columns visible) so the restore effect actually runs
    // on login — this reproduces a real user who already has a saved layout. Seeding []
    // would skip the restore effect and hide the feedback-loop bug.
    const fullOrder = ['description','isin','ccy','bidSprd','bidYield','bidPrice','askPrice','askYield','askSprd','midPrice','midYield','coupon','maturity']
        .map(colId => ({ colId, hide: false }));
    const json = JSON.stringify(fullOrder).replace(/'/g, "''");
    const sql = `
UPDATE user_preferences
SET preference_value = jsonb_set(preference_value, '{columnOrder}', '${json}'::jsonb)
WHERE user_id = (SELECT id FROM users WHERE username = '${TEST_USER.username}')
  AND preference_key = 'ui_settings';`.trim();
    try {
        execFileSync('docker', ['exec', 'mts-stratos-postgres', 'psql', '-U', 'stratos', '-d', 'stratos_db', '-c', sql], { stdio: 'pipe' });
    } catch (e) { console.warn('prefs reset warn:', e.message); }
}

async function getColumnState(page) {
    return page.evaluate(() =>
        window.__bondGridApi.getColumnState().map(c => ({ colId: c.colId, hide: !!c.hide }))
    );
}

async function login(page) {
    await page.goto(BASE_URL, { timeout: 15000, waitUntil: 'domcontentloaded' });
    await page.locator('#username').waitFor({ state: 'visible', timeout: 8000 });
    await page.locator('#username').fill(TEST_USER.username);
    await page.locator('#password').fill(TEST_USER.password);
    await page.locator('button[type="submit"]').click();
    await page.locator('.main-content').waitFor({ state: 'visible', timeout: 15000 });
    await page.locator('.bond-grid .custom-header-wrapper').first().waitFor({ state: 'visible', timeout: 8000 });
    await page.waitForFunction(() => Boolean(window.__bondGridApi?.getColumnState), { timeout: 15000 });
    await sleep(800);
}

async function logout(page) {
    page.once('dialog', d => d.accept().catch(() => {}));
    await page.locator('.sidebar-item.sidebar-logout').click();
    await page.locator('#username').waitFor({ state: 'visible', timeout: 8000 });
}

// Find the CCY header cell and drag it far below the grid (drop outside → hide)
async function dragColumnOut(page, headerText) {
    // Locate the header cell whose text matches
    const headerCell = page.locator('.ag-header-cell', {
        has: page.locator('.header-text', { hasText: new RegExp(`^${headerText}$`, 'i') })
    }).first();

    await headerCell.waitFor({ state: 'visible', timeout: 5000 });
    const box = await headerCell.boundingBox();
    if (!box) throw new Error(`No bounding box for ${headerText} header`);

    const gridBox = await page.locator('.bond-grid').boundingBox();

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    // Drop point: well below the grid, outside the drop zone → AG Grid hides the column
    const endX = startX;
    const endY = gridBox.y + gridBox.height + 200;

    console.log(`  drag ${headerText}: from (${Math.round(startX)},${Math.round(startY)}) to (${Math.round(endX)},${Math.round(endY)})`);

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    // Move in several steps so AG Grid registers the drag
    for (let i = 1; i <= 12; i++) {
        await page.mouse.move(startX + (endX - startX) * i / 12, startY + (endY - startY) * i / 12, { steps: 2 });
        await sleep(30);
    }
    await sleep(150);
    await page.mouse.up();
    await sleep(300);
}

async function main() {
    console.log('='.repeat(60));
    console.log('REAL UI DRAG TEST — remove CCY column by mouse drag');
    console.log('  TWO SEPARATE BROWSERS (browser A hides + logout, browser B logs in)');
    console.log('='.repeat(60));

    resetAllSessions();
    resetPrefs();

    // ---- BROWSER A: hide CCY, then logout ----
    const browserA = await chromium.launch({ headless: HEADLESS, slowMo: HEADLESS ? 0 : 60 });
    const ctxA = await browserA.newContext({ viewport: null });
    const pageA = await ctxA.newPage();

    pageA.on('console', msg => {
        const t = msg.text();
        if (t.includes('Column state') || t.includes('preferences') || t.includes('save') || t.includes('flush')) {
            console.log('  [A]', t);
        }
    });
    const putsA = [];
    pageA.on('request', req => {
        if (req.method() === 'PUT' && req.url().includes('/preferences/ui_settings')) {
            let body = null;
            try { body = JSON.parse(req.postData() || '{}'); } catch {}
            const ccy = body?.columnOrder?.find(c => (c.colId || c) === 'ccy');
            putsA.push({ ccy });
            console.log('  [A][PUT] columnOrder ccy =', JSON.stringify(ccy));
        }
    });

    console.log('\n--- [A] LOGIN ---');
    await login(pageA);
    const before = await getColumnState(pageA);
    console.log('  [A] ccy before:', JSON.stringify(before.find(c => c.colId === 'ccy')));

    console.log('\n--- [A] DRAG CCY OUT OF GRID ---');
    await dragColumnOut(pageA, 'CCY');
    const afterDrag = await getColumnState(pageA);
    const ccyAfter = afterDrag.find(c => c.colId === 'ccy');
    console.log('  [A] ccy after drag:', JSON.stringify(ccyAfter));

    console.log('\n--- [A] LOGOUT IMMEDIATELY (no wait) ---');
    await logout(pageA);
    console.log('  [A] total PUTs fired:', putsA.length);

    // DB right after A logout
    const dbAfterA = readDbCcy();
    console.log('  [A] DB ccy right after logout:', JSON.stringify(dbAfterA));

    // ---- SAME BROWSER re-login (component NOT remounted — this is what broke in real use) ----
    console.log('\n--- [A] RE-LOGIN in the SAME browser (no remount) ---');
    const putsAafter = [];
    pageA.on('request', req => {
        if (req.method() === 'PUT' && req.url().includes('/preferences/ui_settings')) {
            let body = null;
            try { body = JSON.parse(req.postData() || '{}'); } catch {}
            const ccy = body?.columnOrder?.find(c => (c.colId || c) === 'ccy');
            putsAafter.push({ ccy });
            console.log('  [A2][PUT] columnOrder ccy =', JSON.stringify(ccy), (ccy && ccy.hide === false) ? '  <-- OVERWRITE WITH VISIBLE!' : '');
        }
    });
    await login(pageA);
    await sleep(2500); // let any spurious default-state save fire
    const a2 = await getColumnState(pageA);
    const ccyA2 = a2.find(c => c.colId === 'ccy');
    const dbAfterRelogin = readDbCcy();
    console.log('  [A2] ccy after same-browser re-login:', JSON.stringify(ccyA2));
    console.log('  [A2] spurious PUTs after re-login:', putsAafter.length);
    console.log('  [A2] DB after same-browser re-login:', JSON.stringify(dbAfterRelogin));

    // Logout A so the single-active-session check lets browser B log in.
    await logout(pageA);
    await browserA.close();

    // ---- BROWSER B: fresh, separate storage — log in and check ----
    const browserB = await chromium.launch({ headless: HEADLESS, slowMo: HEADLESS ? 0 : 60 });
    const ctxB = await browserB.newContext({ viewport: null });
    const pageB = await ctxB.newPage();

    pageB.on('console', msg => {
        const t = msg.text();
        if (t.includes('Column state') || t.includes('preferences') || t.includes('save') || t.includes('flush') || t.includes('restore')) {
            console.log('  [B]', t);
        }
    });
    const putsB = [];
    pageB.on('request', req => {
        if (req.method() === 'PUT' && req.url().includes('/preferences/ui_settings')) {
            let body = null;
            try { body = JSON.parse(req.postData() || '{}'); } catch {}
            const ccy = body?.columnOrder?.find(c => (c.colId || c) === 'ccy');
            putsB.push({ ccy });
            console.log('  [B][PUT] columnOrder ccy =', JSON.stringify(ccy), '  <-- BROWSER B WROTE TO DB');
        }
    });

    console.log('\n--- [B] LOGIN (separate browser) ---');
    await login(pageB);
    await sleep(2000); // give any spurious save a chance to fire & reveal itself
    const afterRelogin = await getColumnState(pageB);
    const ccyRelogin = afterRelogin.find(c => c.colId === 'ccy');
    console.log('  [B] ccy after login:', JSON.stringify(ccyRelogin));
    console.log('  [B] PUTs fired by browser B:', putsB.length, putsB.length ? '⚠️ B OVERWROTE THE DB' : '');

    const dbFinal = readDbCcy();

    console.log('\n' + '='.repeat(60));
    console.log('DIAGNOSIS');
    console.log('='.repeat(60));
    console.log('  [A] ccy hidden after drag (in-grid):', ccyAfter?.hide === true ? 'YES ✅' : 'NO ❌');
    console.log('  [A] PUT saved ccy.hide=true:', putsA.some(p => p.ccy?.hide === true) ? 'YES ✅' : 'NO ❌');
    console.log('  [A] DB after logout:', JSON.stringify(dbAfterA));
    console.log('  [A2] ccy hidden after SAME-browser re-login:', ccyA2?.hide === true ? 'YES ✅' : 'NO ❌ FAIL');
    console.log('  [A2] DB after SAME-browser re-login:', JSON.stringify(dbAfterRelogin));
    console.log('  [B] spurious PUTs on login:', putsB.length, putsB.length ? '❌ OVERWRITE BUG' : '✅ none');
    console.log('  [B] DB final:', JSON.stringify(dbFinal));
    console.log('  [B] ccy hidden after login:', ccyRelogin?.hide === true ? 'YES ✅ PASS' : 'NO ❌ FAIL');
    console.log('='.repeat(60));

    if (!HEADLESS) { console.log('\n(browsers stay open 8s)'); await sleep(8000); }
    await browserB.close();

    const pass = ccyAfter?.hide === true && ccyA2?.hide === true && ccyRelogin?.hide === true
        && dbAfterRelogin?.hide === true && dbFinal?.hide === true;
    process.exit(pass ? 0 : 1);
}

function readDbCcy() {
    try {
        const dbValue = execFileSync('docker', ['exec', 'mts-stratos-postgres', 'psql', '-U', 'stratos', '-d', 'stratos_db', '-t', '-A', '-c',
            `SELECT preference_value->'columnOrder' FROM user_preferences up JOIN users u ON u.id=up.user_id WHERE u.username='${TEST_USER.username}' AND up.preference_key='ui_settings';`],
            { encoding: 'utf8' }).trim();
        return JSON.parse(dbValue).find(c => c.colId === 'ccy') || null;
    } catch { return null; }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
