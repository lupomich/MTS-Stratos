#!/usr/bin/env node
/**
 * test-show-hidden.mjs
 * End-to-end test for the "Show Hidden Columns" context menu feature.
 *
 * Scenarios:
 *   [S1] Single hidden column: menu shows label "(1)", panel lists it, "Show" restores it,
 *        grid updates immediately, DB persisted.
 *   [S2] Two hidden columns: panel shows "Show All" button, clicking it restores both,
 *        DB persisted.
 *   [S3] Persistence: after [S1] restores CCY, logout+login (same browser) keeps CCY visible,
 *        0 spurious PUTs, DB still hide:false.
 *
 * Usage: node scripts/test-show-hidden.mjs [--headless]
 */

import { chromium } from 'playwright';
import { execFileSync } from 'child_process';

const BASE_URL  = process.env.BASE_URL || 'http://127.0.0.1:3002';
const TEST_USER = { username: 'col-test', password: 'ColTest123!' };
const HEADLESS  = process.argv.includes('--headless');
const ALL_COLS  = ['description','isin','ccy','bidSprd','bidYield','bidPrice','askPrice','askYield','askSprd','midPrice','midYield','coupon','maturity'];

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── DB helpers ───────────────────────────────────────────────────────────────

function psql(sql) {
    execFileSync('docker', ['exec', 'mts-stratos-postgres', 'psql', '-U', 'stratos', '-d', 'stratos_db', '-c', sql], { stdio: 'pipe' });
}

function psqlQuery(sql) {
    return execFileSync('docker', ['exec', 'mts-stratos-postgres', 'psql', '-U', 'stratos', '-d', 'stratos_db', '-t', '-A', '-c', sql],
        { encoding: 'utf8' }).trim();
}

function resetAllSessions() {
    try {
        psql("UPDATE users SET is_logged_in = false, active_session_id = NULL, active_session_at = NULL;");
        psql("UPDATE user_sessions SET is_active = false WHERE is_active = true;");
        execFileSync('docker', ['exec', 'mts-stratos-redis', 'sh', '-lc',
            "redis-cli --scan --pattern 'auth:online:*' | xargs -r redis-cli del >/dev/null"], { stdio: 'pipe' });
    } catch (e) { console.warn('session reset warn:', e.message); }
}

function seedHidden(...hiddenColIds) {
    const order = ALL_COLS.map(colId => ({ colId, hide: hiddenColIds.includes(colId) }));
    const json   = JSON.stringify(order).replace(/'/g, "''");
    const sql = `UPDATE user_preferences SET preference_value = jsonb_set(preference_value, '{columnOrder}', '${json}'::jsonb) WHERE user_id = (SELECT id FROM users WHERE username = '${TEST_USER.username}') AND preference_key = 'ui_settings';`;
    try { psql(sql); } catch (e) { console.warn('seed warn:', e.message); }
}

function readDbColHide(colId) {
    try {
        const raw = psqlQuery(`SELECT preference_value->'columnOrder' FROM user_preferences up JOIN users u ON u.id=up.user_id WHERE u.username='${TEST_USER.username}' AND up.preference_key='ui_settings';`);
        const arr = JSON.parse(raw);
        const entry = arr?.find(c => c.colId === colId);
        return entry ? !!entry.hide : null;
    } catch { return null; }
}

// ── Browser helpers ──────────────────────────────────────────────────────────

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

async function getColHide(page, colId) {
    return page.evaluate(id =>
        !!window.__bondGridApi.getColumnState().find(c => c.colId === id)?.hide,
        colId
    );
}

/** Click the ☰ hamburger icon of the first VISIBLE column header. */
async function openContextMenu(page) {
    const menuIcon = page.locator('.custom-header-wrapper .header-menu-icon').first();
    await menuIcon.waitFor({ state: 'visible', timeout: 5000 });
    await menuIcon.click();
    await sleep(150);
}

/** Wait for and return the "Show Hidden Columns" menu item. */
function showHiddenMenuItem(page) {
    return page.locator('[data-action="showHidden"]');
}

/** Wait for and return the hidden columns panel. */
function hiddenPanel(page) {
    return page.locator('.ag-hidden-columns-panel');
}

// ── Scenarios ────────────────────────────────────────────────────────────────

async function scenarioS1(page) {
    console.log('\n── [S1] Single hidden column (CCY) ─────────────────────');
    seedHidden('ccy');

    console.log('  Logging in...');
    await login(page);

    // Verify CCY is hidden in grid
    const ccyHiddenAfterLogin = await getColHide(page, 'ccy');
    console.log('  CCY hidden after login:', ccyHiddenAfterLogin ? 'YES ✅' : 'NO ❌');

    // Open context menu on DESCRIPTION header (always visible)
    await openContextMenu(page);

    // Assert menu item appears with count (1)
    const menuItem = showHiddenMenuItem(page);
    await menuItem.waitFor({ state: 'visible', timeout: 3000 });
    const menuText = await menuItem.textContent();
    const menuHas1 = menuText.includes('(1)');
    console.log(`  Menu item text: "${menuText.trim()}" → count (1): ${menuHas1 ? 'YES ✅' : 'NO ❌'}`);

    // Click "Show Hidden Columns" — force:true because the fixed menu may be off-screen
    // in headless mode (positioned by getBoundingClientRect of the header icon)
    await menuItem.click({ force: true });
    await sleep(200);

    // Assert panel is visible
    const panel = hiddenPanel(page);
    await panel.waitFor({ state: 'visible', timeout: 3000 });
    console.log('  Panel visible: ✅');

    // Assert panel lists CCY
    const panelText = await panel.textContent();
    const panelHasCcy = panelText.toUpperCase().includes('CCY');
    console.log('  Panel lists CCY:', panelHasCcy ? 'YES ✅' : 'NO ❌');

    // Assert NO "Show All" button (only one hidden col)
    const showAllBtn = panel.locator('.hidden-panel-show-all-btn');
    const showAllVisible = await showAllBtn.isVisible().catch(() => false);
    console.log('  "Show All" absent (1 col):', !showAllVisible ? 'YES ✅' : 'NO ❌');

    // Click "Show" next to CCY
    const showBtn = panel.locator('.hidden-panel-show-btn', { hasText: /show|mostra/i }).first();
    await showBtn.click();
    await sleep(300);

    // Panel should be gone
    const panelGone = !(await panel.isVisible().catch(() => false));
    console.log('  Panel closed after Show:', panelGone ? 'YES ✅' : 'NO ❌');

    // CCY should be visible in grid
    const ccyNowVisible = !(await getColHide(page, 'ccy'));
    console.log('  CCY visible in grid:', ccyNowVisible ? 'YES ✅' : 'NO ❌');

    // Wait for serialized save queue to flush to DB
    await sleep(1500);
    const dbHide = readDbColHide('ccy');
    console.log(`  DB ccy.hide after Show: ${dbHide} → expected false: ${dbHide === false ? '✅' : '❌'}`);

    return { ccyHiddenAfterLogin, menuHas1, panelHasCcy, showAllAbsent: !showAllVisible, panelGone, ccyNowVisible, dbHide };
}

async function scenarioS2(page) {
    console.log('\n── [S2] Two hidden columns (CCY + COUPON) — Show All ────');

    // Re-seed two hidden cols
    seedHidden('ccy', 'coupon');
    resetAllSessions();
    await login(page);

    const ccyH = await getColHide(page, 'ccy');
    const couponH = await getColHide(page, 'coupon');
    console.log('  CCY hidden:', ccyH ? 'YES ✅' : 'NO ❌');
    console.log('  COUPON hidden:', couponH ? 'YES ✅' : 'NO ❌');

    await openContextMenu(page);

    const menuItem = showHiddenMenuItem(page);
    await menuItem.waitFor({ state: 'attached', timeout: 3000 });
    const menuText2 = await menuItem.textContent();
    const menuHas2 = menuText2.includes('(2)');
    console.log(`  Menu item text: "${menuText2.trim()}" → count (2): ${menuHas2 ? 'YES ✅' : 'NO ❌'}`);

    await menuItem.click({ force: true });
    await sleep(200);

    const panel = hiddenPanel(page);
    await panel.waitFor({ state: 'visible', timeout: 3000 });

    const showAllBtn = panel.locator('.hidden-panel-show-all-btn');
    await showAllBtn.waitFor({ state: 'visible', timeout: 2000 });
    console.log('  "Show All" button visible: ✅');

    // Click "Show All"
    await showAllBtn.click();
    await sleep(300);

    const panelGone = !(await panel.isVisible().catch(() => false));
    const ccyBack = !(await getColHide(page, 'ccy'));
    const couponBack = !(await getColHide(page, 'coupon'));
    console.log('  Panel closed after Show All:', panelGone ? 'YES ✅' : 'NO ❌');
    console.log('  CCY visible:', ccyBack ? 'YES ✅' : 'NO ❌');
    console.log('  COUPON visible:', couponBack ? 'YES ✅' : 'NO ❌');

    await sleep(1500);
    const dbCcy = readDbColHide('ccy');
    const dbCoupon = readDbColHide('coupon');
    console.log(`  DB ccy.hide=${dbCcy} coupon.hide=${dbCoupon} → both false: ${dbCcy === false && dbCoupon === false ? '✅' : '❌'}`);

    return { menuHas2, panelGone, ccyBack, couponBack, dbCcy, dbCoupon };
}

async function scenarioS3AfterS1(page) {
    console.log('\n── [S3] Persistence after S1: re-login keeps CCY visible ─');
    // After S1 we have CCY visible + saved. Now logout & re-login same browser.
    const puts = [];
    page.on('request', req => {
        if (req.method() === 'PUT' && req.url().includes('/preferences/ui_settings')) {
            let body = null;
            try { body = JSON.parse(req.postData() || '{}'); } catch {}
            const ccy = body?.columnOrder?.find(c => c.colId === 'ccy');
            puts.push({ ccy });
            if (ccy?.hide === true) console.log('  [S3][PUT] ⚠️ spurious save with ccy hide:true!');
        }
    });

    await logout(page);
    await login(page);
    await sleep(2000); // let any spurious save fire

    const ccyH = await getColHide(page, 'ccy');
    const dbHide = readDbColHide('ccy');
    console.log('  CCY hidden after re-login:', ccyH ? 'YES ❌ FAIL' : 'NO (visible) ✅');
    console.log('  Spurious PUTs after re-login:', puts.length, puts.length ? '❌' : '✅ none');
    console.log(`  DB ccy.hide=${dbHide} → expected false: ${dbHide === false ? '✅' : '❌'}`);

    return { ccyVisible: !ccyH, spuriousPuts: puts.length, dbHide };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('='.repeat(62));
    console.log('SHOW HIDDEN COLUMNS — End-to-End Test');
    console.log('='.repeat(62));

    resetAllSessions();
    seedHidden('ccy');

    const browser = await chromium.launch({ headless: HEADLESS, slowMo: HEADLESS ? 0 : 60 });
    const ctx     = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page    = await ctx.newPage();

    page.on('console', msg => {
        const t = msg.text();
        if (t.includes('Column state') || t.includes('preferences') || t.includes('save') || t.includes('restore')) {
            console.log('  [console]', t);
        }
    });

    let r1 = {}, r2 = {}, r3 = {};
    try {
        r1 = await scenarioS1(page);
        // S3 runs in the same browser immediately after S1 (same-browser re-login test)
        r3 = await scenarioS3AfterS1(page);
        // S2 needs a fresh login with 2 hidden cols
        await logout(page).catch(() => {});
        resetAllSessions();
        r2 = await scenarioS2(page);
    } catch (e) {
        console.error('\nFatal error in scenario:', e);
    }

    if (!HEADLESS) { console.log('\n(browser stays open 6s)'); await sleep(6000); }
    await browser.close();

    // ── Results ──
    console.log('\n' + '='.repeat(62));
    console.log('RESULTS');
    console.log('='.repeat(62));
    console.log('[S1] CCY hidden on login:          ', r1.ccyHiddenAfterLogin  ? '✅' : '❌');
    console.log('[S1] Menu shows count (1):          ', r1.menuHas1             ? '✅' : '❌');
    console.log('[S1] Panel lists CCY:               ', r1.panelHasCcy          ? '✅' : '❌');
    console.log('[S1] "Show All" absent (1 col):     ', r1.showAllAbsent        ? '✅' : '❌');
    console.log('[S1] Panel closes after Show:       ', r1.panelGone            ? '✅' : '❌');
    console.log('[S1] CCY visible after Show:        ', r1.ccyNowVisible        ? '✅' : '❌');
    console.log('[S1] DB ccy.hide=false after Show:  ', r1.dbHide === false     ? '✅' : '❌');
    console.log('[S2] Menu shows count (2):          ', r2.menuHas2             ? '✅' : '❌');
    console.log('[S2] Panel closes after Show All:   ', r2.panelGone            ? '✅' : '❌');
    console.log('[S2] CCY + COUPON visible:          ', r2.ccyBack && r2.couponBack ? '✅' : '❌');
    console.log('[S2] DB both hide=false:            ', r2.dbCcy === false && r2.dbCoupon === false ? '✅' : '❌');
    console.log('[S3] CCY visible after re-login:    ', r3.ccyVisible           ? '✅' : '❌');
    console.log('[S3] 0 spurious PUTs:               ', r3.spuriousPuts === 0   ? '✅' : `❌ (${r3.spuriousPuts})`);
    console.log('[S3] DB ccy.hide=false:             ', r3.dbHide === false     ? '✅' : '❌');
    console.log('='.repeat(62));

    const pass =
        r1.ccyHiddenAfterLogin && r1.menuHas1 && r1.panelHasCcy && r1.showAllAbsent &&
        r1.panelGone && r1.ccyNowVisible && r1.dbHide === false &&
        r2.menuHas2 && r2.panelGone && r2.ccyBack && r2.couponBack &&
        r2.dbCcy === false && r2.dbCoupon === false &&
        r3.ccyVisible && r3.spuriousPuts === 0 && r3.dbHide === false;

    console.log(pass ? '\n✅ ALL PASS' : '\n❌ SOME FAILURES');
    process.exit(pass ? 0 : 1);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
