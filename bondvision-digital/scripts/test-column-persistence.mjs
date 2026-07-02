#!/usr/bin/env node
/**
 * test-column-persistence.mjs
 * Focused E2E test for column state persistence (move + hide) across logout/login.
 *
 * Usage:
 *   node scripts/test-column-persistence.mjs [--runs N] [--headless]
 *
 * Defaults: 3 runs, visible browser.
 */

import { chromium } from 'playwright';
import { execFileSync } from 'child_process';

const BASE_URL   = process.env.BASE_URL  || 'http://127.0.0.1:3002';
const API_BASE   = process.env.API_BASE  || 'http://127.0.0.1:3003/api';
const ADMIN      = { username: 'admin', password: 'admin123' };
const TEST_USER  = { username: 'col-test', email: 'col-test@mts.local', password: 'ColTest123!', role: 'trader' };
const TIMEOUT_MS = 20000;
const SAVE_WAIT  = 3000; // ms to wait after action to ensure debounce fires

const args     = process.argv.slice(2);
const RUNS     = Number(args[args.indexOf('--runs') + 1] || 3);
const HEADLESS = args.includes('--headless');

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── Grid helpers (browser-side evaluate) ────────────────────────────────────

function getApi(page) {
    return page.evaluate(() => {
        const api = window.__bondGridApi;
        if (!api || typeof api.getColumnState !== 'function') return null;
        return true; // can't return the api object, just check it exists
    });
}

async function waitForGridApi(page, timeout = TIMEOUT_MS) {
    await page.waitForFunction(
        () => Boolean(window.__bondGridApi && typeof window.__bondGridApi.getColumnState === 'function'),
        { timeout }
    );
}

async function getColumnState(page) {
    return page.evaluate(() => {
        return window.__bondGridApi.getColumnState().map(c => ({ colId: c.colId, hide: !!c.hide }));
    });
}

async function applyColumnOrder(page, orderedColIds) {
    await page.evaluate((ids) => {
        window.__bondGridApi.applyColumnState({
            state: ids.map(colId => ({ colId })),
            applyOrder: true
        });
    }, orderedColIds);
}

async function setColumnHide(page, colId, hide) {
    await page.evaluate(({ id, hidden }) => {
        const api = window.__bondGridApi;
        // try setColumnsVisible first (fires columnVisible event)
        if (typeof api.setColumnsVisible === 'function') {
            api.setColumnsVisible([id], !hidden);
        } else {
            api.applyColumnState({ state: [{ colId: id, hide: hidden }] });
        }
    }, { id: colId, hidden: hide });
}

async function waitForSave(page, timeoutMs = SAVE_WAIT + 4000) {
    try {
        await page.waitForResponse(
            r => r.request().method() === 'PUT' && r.url().includes('/preferences/ui_settings') && r.status() < 300,
            { timeout: timeoutMs }
        );
        return true;
    } catch {
        return false;
    }
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

async function apiToken(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error(`Login API failed: ${res.status}`);
    const { token } = await res.json();
    return token;
}

async function apiLogout(token) {
    await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
}

async function resetAllSessions() {
    const pgContainer = 'mts-stratos-postgres';
    const pgUser = 'stratos';
    const pgDb   = 'stratos_db';
    try {
        execFileSync('docker', ['exec', pgContainer, 'psql', '-U', pgUser, '-d', pgDb, '-c',
            "UPDATE users SET is_logged_in = false, active_session_id = NULL, active_session_at = NULL;"], { stdio: 'pipe' });
        execFileSync('docker', ['exec', pgContainer, 'psql', '-U', pgUser, '-d', pgDb, '-c',
            "UPDATE user_sessions SET is_active = false WHERE is_active = true;"], { stdio: 'pipe' });
        execFileSync('docker', ['exec', 'mts-stratos-redis', 'sh', '-lc',
            "redis-cli --scan --pattern 'auth:online:*' | xargs -r redis-cli del >/dev/null"], { stdio: 'pipe' });
        console.log('  ✓ Auth/session state reset');
    } catch (e) {
        console.warn('  ⚠ Session reset warning:', e.message);
    }
}

async function ensureTestUser() {
    const token = await apiToken(ADMIN.username, ADMIN.password);
    const usersRes = await fetch(`${API_BASE}/users`, { headers: { Authorization: `Bearer ${token}` } });
    const { users } = await usersRes.json();
    const exists = users.some(u => u.username === TEST_USER.username);
    if (!exists) {
        const r = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(TEST_USER)
        });
        if (!r.ok) throw new Error(`Create test user failed: ${r.status}`);
        console.log('  ✓ Created test user:', TEST_USER.username);
    } else {
        console.log('  ✓ Test user already exists:', TEST_USER.username);
    }
    await apiLogout(token);
}

async function resetUserPreferences() {
    // Direct DB reset via psql in the postgres container
    const pgContainer = 'mts-stratos-postgres';
    const pgUser = 'stratos';
    const pgDb   = 'stratos_db';
    const sql = `
UPDATE user_preferences
SET preference_value = jsonb_set(
    jsonb_set(preference_value, '{columnOrder}', '[]'),
    '{sorts}', '[]'
)
WHERE user_id = (SELECT id FROM users WHERE username = '${TEST_USER.username}')
  AND preference_key = 'ui_settings';
`.trim();
    try {
        execFileSync('docker', ['exec', pgContainer, 'psql', '-U', pgUser, '-d', pgDb, '-c', sql], { stdio: 'pipe' });
        console.log('  ✓ Preferences reset to defaults');
    } catch (e) {
        console.warn('  ⚠ Could not reset preferences via psql:', e.message);
    }
}

async function loginGUI(page, username, password) {
    await page.goto(BASE_URL, { timeout: 15000, waitUntil: 'domcontentloaded' });
    await page.locator('#username').waitFor({ state: 'visible', timeout: 8000 });
    await page.locator('#username').fill(username);
    await page.locator('#password').fill(password);
    await page.locator('button[type="submit"]').click();
    await page.locator('.main-content').waitFor({ state: 'visible', timeout: 15000 });
    await page.locator('.bond-grid .custom-header-wrapper').first().waitFor({ state: 'visible', timeout: 8000 });
    await waitForGridApi(page);
    await sleep(600); // let preferences load from backend
}

async function logoutGUI(page) {
    page.once('dialog', d => d.accept().catch(() => {}));
    await page.locator('.sidebar-item.sidebar-logout').click();
    await page.locator('#username').waitFor({ state: 'visible', timeout: 8000 });
}

// ─── Individual test cases ────────────────────────────────────────────────────

async function testColumnMovePersistence(page, run) {
    const label = `[Run ${run}] MOVE:`;
    await loginGUI(page, TEST_USER.username, TEST_USER.password);

    // Read initial order
    const before = await getColumnState(page);
    const ids = before.map(c => c.colId);
    console.log(`  ${label} initial order (first 5): ${ids.slice(0, 5).join(', ')}`);

    // Move 'ccy' to the last position
    const ccyIdx = ids.indexOf('ccy');
    if (ccyIdx < 0) throw new Error('ccy column not found');
    const newOrder = ids.filter(id => id !== 'ccy');
    newOrder.push('ccy'); // put ccy last

    // Register save-watcher BEFORE applying the change (immediate save fires synchronously)
    const savePromise = page.waitForResponse(
        r => r.request().method() === 'PUT' && r.url().includes('/preferences/ui_settings'),
        { timeout: 6000 }
    ).catch(() => null);

    await applyColumnOrder(page, newOrder);

    const afterMove = await getColumnState(page);
    const movedIdx = afterMove.findIndex(c => c.colId === 'ccy');
    console.log(`  ${label} ccy is now at index ${movedIdx} (expected ${afterMove.length - 1})`);
    if (movedIdx !== afterMove.length - 1) throw new Error(`Move not applied in-grid (idx=${movedIdx})`);

    // Wait for immediate save to complete, then logout
    const saveResponse = await savePromise;
    if (saveResponse && saveResponse.status() < 300) {
        console.log(`  ${label} ✓ immediate save PUT observed (status ${saveResponse.status()})`);
    } else {
        console.log(`  ${label} ⚠ save PUT not observed or failed (status ${saveResponse?.status()})`);
    }

    await logoutGUI(page);
    await loginGUI(page, TEST_USER.username, TEST_USER.password);

    const afterLogin = await getColumnState(page);
    const persistedIdx = afterLogin.findIndex(c => c.colId === 'ccy');
    console.log(`  ${label} after re-login ccy is at index ${persistedIdx} (expected ${afterLogin.length - 1})`);
    if (persistedIdx !== afterLogin.length - 1) {
        throw new Error(`FAIL: ccy not persisted at last position after re-login (got idx ${persistedIdx})`);
    }
    console.log(`  ${label} ✅ PASS — column move persisted`);
}

async function testColumnHidePersistence(page, run) {
    const label = `[Run ${run}] HIDE:`;

    // Make sure we're logged in (from previous test)
    const mainVisible = await page.locator('.main-content').isVisible().catch(() => false);
    if (!mainVisible) await loginGUI(page, TEST_USER.username, TEST_USER.password);

    // Ensure ccy is visible first
    const before = await getColumnState(page);
    const ccyBefore = before.find(c => c.colId === 'ccy');
    if (ccyBefore?.hide) {
        // show it first
        const showSavePromise = waitForSave(page);
        await setColumnHide(page, 'ccy', false);
        await showSavePromise.catch(() => {});
        await sleep(500);
    }

    // Now hide it — register save-watcher BEFORE the change (immediate save)
    const savePromise = page.waitForResponse(
        r => r.request().method() === 'PUT' && r.url().includes('/preferences/ui_settings'),
        { timeout: 6000 }
    ).catch(() => null);

    await setColumnHide(page, 'ccy', true);

    const afterHide = await getColumnState(page);
    const ccyAfterHide = afterHide.find(c => c.colId === 'ccy');
    console.log(`  ${label} ccy.hide=${ccyAfterHide?.hide} (expected true)`);
    if (!ccyAfterHide?.hide) throw new Error('Hide not applied in-grid');

    // Wait for immediate save to complete, then logout
    const saveResponse = await savePromise;
    if (saveResponse && saveResponse.status() < 300) {
        console.log(`  ${label} ✓ immediate save PUT observed (status ${saveResponse.status()})`);
    } else {
        console.log(`  ${label} ⚠ save PUT not observed or failed (status ${saveResponse?.status()})`);
    }

    await logoutGUI(page);
    await loginGUI(page, TEST_USER.username, TEST_USER.password);

    const afterLogin = await getColumnState(page);
    const ccyAfterLogin = afterLogin.find(c => c.colId === 'ccy');
    console.log(`  ${label} after re-login ccy.hide=${ccyAfterLogin?.hide} (expected true)`);
    if (!ccyAfterLogin?.hide) {
        throw new Error(`FAIL: ccy not hidden after re-login (hide=${ccyAfterLogin?.hide})`);
    }
    console.log(`  ${label} ✅ PASS — column hide persisted`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('='.repeat(60));
    console.log('COLUMN PERSISTENCE TEST');
    console.log(`Runs: ${RUNS}  |  Headless: ${HEADLESS}  |  URL: ${BASE_URL}`);
    console.log('='.repeat(60));

    await resetAllSessions();
    await ensureTestUser();

    const browser = await chromium.launch({ headless: HEADLESS, slowMo: HEADLESS ? 0 : 100 });
    const context = await browser.newContext({ viewport: null });
    const page    = await context.newPage();

    let movePass = 0, moveFail = 0;
    let hidePass = 0, hideFail = 0;

    for (let run = 1; run <= RUNS; run++) {
        console.log(`\n${'─'.repeat(50)}`);
        console.log(`RUN ${run}/${RUNS}`);
        console.log('─'.repeat(50));

        await resetUserPreferences();

        // --- Test 1: Column Move ---
        try {
            await testColumnMovePersistence(page, run);
            movePass++;
        } catch (e) {
            console.error(`  ❌ MOVE FAIL (run ${run}): ${e.message}`);
            moveFail++;
        }

        // --- Test 2: Column Hide ---
        try {
            await testColumnHidePersistence(page, run);
            hidePass++;
        } catch (e) {
            console.error(`  ❌ HIDE FAIL (run ${run}): ${e.message}`);
            hideFail++;
        }

        // Cleanup: logout for next run
        const mainVisible = await page.locator('.main-content').isVisible().catch(() => false);
        if (mainVisible) await logoutGUI(page).catch(() => {});
    }

    await browser.close();

    console.log('\n' + '='.repeat(60));
    console.log('RESULTS');
    console.log('='.repeat(60));
    console.log(`Column MOVE: ${movePass}/${RUNS} passed  ${moveFail > 0 ? '❌' : '✅'}`);
    console.log(`Column HIDE: ${hidePass}/${RUNS} passed  ${hideFail > 0 ? '❌' : '✅'}`);
    console.log('='.repeat(60));

    if (moveFail > 0 || hideFail > 0) process.exit(1);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
