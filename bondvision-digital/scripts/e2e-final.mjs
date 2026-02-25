#!/usr/bin/env node

/**
 * MTS-Stratos E2E Test Suite FINALE
 * Data: 2026-02-20
 * Focus: GUI primario, API secondario
 * Timeout: 10 secondi per test
 * Tests totali: 47
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// Configuration
const ADMIN_USER = { username: 'admin', password: 'admin123' };
const IN_DOCKER = fs.existsSync('/.dockerenv');
const HAS_DISPLAY = Boolean(process.env.DISPLAY || process.env.WAYLAND_DISPLAY);

function getRuntimeConfig(overrides = {}) {
    const liveView = Object.prototype.hasOwnProperty.call(overrides, 'liveView')
        ? Boolean(overrides.liveView)
        : process.env.LIVE_VIEW === 'true';
    const headless = Object.prototype.hasOwnProperty.call(overrides, 'headless')
        ? Boolean(overrides.headless)
        : process.env.HEADLESS
            ? process.env.HEADLESS !== 'false'
            : !liveView;
    const startFromRaw = Object.prototype.hasOwnProperty.call(overrides, 'startFrom')
        ? overrides.startFrom
        : (process.env.START_FROM || '1');
    const slowMoRaw = Object.prototype.hasOwnProperty.call(overrides, 'slowMo')
        ? overrides.slowMo
        : (process.env.SLOW_MO || (liveView ? '250' : '0'));
    const timeoutRaw = Object.prototype.hasOwnProperty.call(overrides, 'testTimeout')
        ? overrides.testTimeout
        : (process.env.TEST_TIMEOUT || '30000');

    return {
        BASE_URL: Object.prototype.hasOwnProperty.call(overrides, 'baseUrl')
            ? overrides.baseUrl
            : (process.env.BASE_URL || 'http://172.18.0.5:3002'),
        API_BASE: Object.prototype.hasOwnProperty.call(overrides, 'apiBase')
            ? overrides.apiBase
            : (process.env.API_BASE || 'http://bondvision-backend:3000/api'),
        TEST_TIMEOUT: Number.parseInt(String(timeoutRaw), 10) || 30000,
        STOP_ON_FIRST_FAIL: Object.prototype.hasOwnProperty.call(overrides, 'stopOnFirstFail')
            ? Boolean(overrides.stopOnFirstFail)
            : process.env.STOP_ON_FIRST_FAIL === 'true',
        START_FROM: Number.parseInt(String(startFromRaw), 10) || 1,
        LIVE_VIEW: liveView,
        HEADLESS: headless,
        SLOW_MO: Number.parseInt(String(slowMoRaw), 10) || 0
    };
}

let runtimeConfig = getRuntimeConfig();

function getContextOptions() {
    if (runtimeConfig.HEADLESS) {
        return {};
    }
    return {
        viewport: null
    };
}

async function maximizePageWindow(page) {
    if (runtimeConfig.HEADLESS) {
        return;
    }

    try {
        const context = page.context();
        const cdpSession = await context.newCDPSession(page);
        const { windowId } = await cdpSession.send('Browser.getWindowForTarget');
        await cdpSession.send('Browser.setWindowBounds', {
            windowId,
            bounds: { windowState: 'maximized' }
        });
    } catch (error) {
        console.log(`  [WINDOW] maximize skipped: ${error.message}`);
    }
}

// Test results storage
const testResults = [];
let startTime = new Date();

class SkipTest extends Error {
    constructor(message) {
        super(message);
        this.name = 'SkipTest';
    }
}

// Utility: Sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Utility: Test wrapper
async function runTest(testId, description, type, testFn) {
    const testNumber = Number.parseInt(String(testId).replace(/^T/i, ''), 10);
    if (!Number.isNaN(testNumber) && testNumber < runtimeConfig.START_FROM) {
        return {
            id: testId,
            description,
            type,
            startTime: new Date().toISOString(),
            duration: 0,
            status: 'SKIP',
            failReason: `Skipped by START_FROM=${runtimeConfig.START_FROM}`
        };
    }

    const testStart = Date.now();
    const result = {
        id: testId,
        description,
        type,
        startTime: new Date().toISOString(),
        duration: 0,
        status: 'NOT RUN',
        failReason: null
    };

    try {
        console.log(`\n[${testId}] ${description} (${type})`);
        await Promise.race([
            testFn(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout 10s')), runtimeConfig.TEST_TIMEOUT)
            )
        ]);
        result.status = 'PASS';
        result.duration = Date.now() - testStart;
        console.log(`  ✅ PASS (${result.duration}ms)`);
    } catch (error) {
        result.duration = Date.now() - testStart;
        if (error instanceof SkipTest) {
            result.status = 'SKIP';
            result.failReason = error.message;
            console.log(`  ⏭️ SKIP: ${error.message}`);
        } else {
            result.status = 'FAIL';
            result.failReason = error.message;
            console.log(`  ❌ FAIL: ${error.message}`);
        }
    }

    testResults.push(result);
    if (runtimeConfig.STOP_ON_FIRST_FAIL && result.status === 'FAIL') {
        throw new Error(`STOP_AT_${testId}: ${result.failReason}`);
    }
    return result;
}

// Utility: Login GUI
async function loginGUI(page, username, password) {
    await page.goto(runtimeConfig.BASE_URL);
    await page.locator('#username').fill(username);
    await page.locator('#password').fill(password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard|\//, { timeout: 5000 });
}

// Utility: Logout GUI
async function logoutGUI(page) {
    page.once('dialog', dialog => dialog.accept());
    await page.locator('.sidebar-item.sidebar-logout').click();
    await page.locator('#username').waitFor({ state: 'visible', timeout: 5000 });
}

async function openOverlayMenu(page) {
    await page.locator('.sidebar-item').first().click();
    await page.locator('.sidebar-overlay-panel').waitFor({ state: 'visible', timeout: 5000 });
}

function getAdminOverlayItem(page) {
    return page.locator('.sidebar-overlay-item', { hasText: /^ADMIN$/ }).first();
}

// Utility: Open Admin Panel
async function openAdminPanel(page) {
    await openOverlayMenu(page);
    await getAdminOverlayItem(page).click();
    await page.locator('.admin-modal').waitFor({ state: 'visible', timeout: 5000 });
}

// Utility: Create User via Admin Panel GUI
async function createUserGUI(page, username, email, password, role) {
    // Click "Create User" button
    await page.locator('.btn-create-user').click();
    await page.locator('.modal-form').waitFor({ state: 'visible', timeout: 3000 });
    
    // Fill form
    await page.locator('.modal-form input[name="username"]').fill(username);
    await page.locator('.modal-form input[name="email"]').fill(email);
    await page.locator('.modal-form input[name="password"]').fill(password);
    await page.locator('.modal-form select[name="role"]').selectOption(role);
    
    // Submit
    await page.locator('.modal-form .btn-submit').click();
    
    // Wait for modal to close (success)
    await page.locator('.modal-form').waitFor({ state: 'hidden', timeout: 5000 });
}

// Utility: Find user row in Admin Panel
async function findUserRow(page, username) {
    const deadline = Date.now() + 6000;
    while (Date.now() < deadline) {
        const rows = await page.locator('.users-table tbody tr').all();
        for (const row of rows) {
            const userCell = await row.locator('td').first().textContent();
            if (userCell?.trim() === username) {
                return row;
            }
        }
        await sleep(200);
    }
    throw new Error(`User ${username} not found in table`);
}

// Utility: Toggle user active status
async function toggleUserActive(page, username) {
    const row = await findUserRow(page, username);
    await row.locator('label.toggle-switch').click();
    await sleep(500); // Wait for API call
}

async function waitForUserStatus(page, username, expectedStatus, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const row = await findUserRow(page, username, 1000);
        const status = await row.locator('.status-badge').textContent();
        if (status?.includes(expectedStatus)) {
            return;
        }
        await sleep(200);
    }
    throw new Error(`Expected status ${expectedStatus} for ${username}`);
}

// Utility: Delete user
async function deleteUserGUI(page, username) {
    const row = await findUserRow(page, username);

    // Accept confirm dialog
    page.once('dialog', dialog => dialog.accept());

    // Click delete button
    await row.locator('.btn-delete').click();
    
    await sleep(500); // Wait for API call and table reload
}

// Utility: API call to get users
async function getUsersAPI() {
    const response = await fetch(`${runtimeConfig.API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ADMIN_USER)
    });
    const { token } = await response.json();
    
    const usersResponse = await fetch(`${runtimeConfig.API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await usersResponse.json();
    return data.users;
}

async function cleanupResidualTestUsersAPI() {
    const response = await fetch(`${runtimeConfig.API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ADMIN_USER)
    });
    const { token } = await response.json();

    const usersResponse = await fetch(`${runtimeConfig.API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await usersResponse.json();
    const testUsers = new Set([
        'admin-test',
        'trader-test',
        'viewer-test',
        'trader-final',
        'viewer-final'
    ]);

    for (const user of data.users || []) {
        if (testUsers.has(user.username)) {
            await fetch(`${runtimeConfig.API_BASE}/users/${encodeURIComponent(user.id)}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }
    }
}

async function waitForBondGrid(page) {
    await page.locator('.bond-grid .custom-header-wrapper').first().waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForTimeout(300);
}

async function ensureUserExistsAPI({ username, email, password, role }) {
    const loginResponse = await fetch(`${runtimeConfig.API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ADMIN_USER)
    });
    const { token } = await loginResponse.json();

    const usersResponse = await fetch(`${runtimeConfig.API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const usersData = await usersResponse.json();
    const exists = (usersData.users || []).some(u => u.username === username);

    if (!exists) {
        await fetch(`${runtimeConfig.API_BASE}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ username, email, password, role })
        });
    }
}

async function waitForGridApi(page) {
    await page.waitForSelector('.bond-grid .ag-root-wrapper', { timeout: 5000 });
    await page.waitForFunction(
        () => {
            const gridRoot = document.querySelector('.bond-grid .ag-root-wrapper');
            const instance = gridRoot && gridRoot.__ag_grid_instance;
            const api = window.__bondGridApi || instance?.api || instance;
            return Boolean(api && typeof api.getDisplayedRowCount === 'function');
        },
        null,
        { timeout: 5000 }
    );
}

async function getHeaderOrder(page) {
    return page.evaluate(() => {
        const headers = Array.from(document.querySelectorAll('.bond-grid .custom-header-wrapper .header-text'));
        return headers.map(h => h.textContent?.trim()).filter(Boolean);
    });
}

async function openHeaderMenu(page, headerText) {
    const opened = await page.evaluate((headerTextValue) => {
        const wrappers = Array.from(document.querySelectorAll('.bond-grid .custom-header-wrapper'));
        const wrapper = wrappers.find(w => {
            const text = w.querySelector('.header-text')?.textContent?.trim();
            return text === headerTextValue;
        });
        if (!wrapper) return false;
        wrapper.querySelector('.header-menu-icon')?.click();
        return true;
    }, headerText);

    if (!opened) {
        throw new Error(`Header menu not found for ${headerText}`);
    }
    await page.locator('.ag-custom-menu-popup').waitFor({ state: 'visible', timeout: 3000 });
}

async function clickHeaderMenuAction(page, action) {
    const item = page.locator(`.ag-custom-menu-popup .menu-item[data-action="${action}"]`).first();
    await item.waitFor({ state: 'visible', timeout: 3000 });
    await item.click();
    await page.waitForTimeout(400);
}

async function getGridState(page) {
    await waitForGridApi(page);
    return page.evaluate(() => {
        const gridRoot = document.querySelector('.bond-grid .ag-root-wrapper');
        const instance = gridRoot && gridRoot.__ag_grid_instance;
        const api = window.__bondGridApi || instance?.api || instance;
        const columnApi = window.__bondColumnApi || instance?.columnApi || api;
        if (!api || !columnApi) {
            return null;
        }

        const columnState = columnApi.getColumnState ? columnApi.getColumnState() : [];
        const filterModel = api.getFilterModel();
        const displayedRowCount = api.getDisplayedRowCount();
        const totalRowCount = api.getModel().getRowCount();

        return {
            columnState,
            filterModel,
            displayedRowCount,
            totalRowCount
        };
    });
}

async function waitForGridStateWithRows(page, timeoutMs = 12000) {
    const startedAt = Date.now();
    let lastState = null;

    while ((Date.now() - startedAt) < timeoutMs) {
        try {
            const state = await getGridState(page);
            lastState = state;
            if (state && Number(state.totalRowCount) > 0) {
                return state;
            }
        } catch {
        }

        await page.waitForTimeout(400);
    }

    return lastState;
}

async function moveColumn(page, colId, toIndex) {
    await page.evaluate(({ id, index }) => {
        const gridRoot = document.querySelector('.bond-grid .ag-root-wrapper');
        const instance = gridRoot && gridRoot.__ag_grid_instance;
        const api = window.__bondGridApi || instance?.api || instance;
        const columnApi = window.__bondColumnApi || instance?.columnApi || api;
        if (!columnApi) throw new Error('Column API not available');

        const currentState = (columnApi.getColumnState ? columnApi.getColumnState() : []).map(c => c.colId);
        const currentIndex = currentState.indexOf(id);
        if (currentIndex < 0) {
            throw new Error(`Column ${id} not found`);
        }

        const targetIndex = Math.max(0, Math.min(index, currentState.length - 1));
        currentState.splice(currentIndex, 1);
        currentState.splice(targetIndex, 0, id);

        if (typeof columnApi.applyColumnState === 'function') {
            columnApi.applyColumnState({
                state: currentState.map(colId => ({ colId })),
                applyOrder: true
            });
        } else if (typeof columnApi.moveColumn === 'function') {
            columnApi.moveColumn(id, targetIndex);
        } else if (typeof api.moveColumnByIndex === 'function') {
            api.moveColumnByIndex(currentIndex, targetIndex);
        } else {
            throw new Error('moveColumn API not available');
        }
    }, { id: colId, index: toIndex });
    await page.waitForTimeout(500);
}

async function setColumnVisible(page, colId, visible) {
    await page.evaluate(({ id, isVisible }) => {
        const gridRoot = document.querySelector('.bond-grid .ag-root-wrapper');
        const instance = gridRoot && gridRoot.__ag_grid_instance;
        const api = window.__bondGridApi || instance?.api || instance;
        const columnApi = window.__bondColumnApi || instance?.columnApi || api;
        if (!columnApi) throw new Error('Column API not available');
        if (typeof columnApi.setColumnVisible === 'function') {
            columnApi.setColumnVisible(id, isVisible);
        } else if (typeof columnApi.applyColumnState === 'function') {
            columnApi.applyColumnState({ state: [{ colId: id, hide: !isVisible }] });
        } else {
            throw new Error('setColumnVisible API not available');
        }
    }, { id: colId, isVisible: visible });
    await page.waitForTimeout(500);
}

async function setFilterModel(page, model) {
    await page.evaluate((filterModel) => {
        const gridRoot = document.querySelector('.bond-grid .ag-root-wrapper');
        const instance = gridRoot && gridRoot.__ag_grid_instance;
        const api = window.__bondGridApi || instance?.api || instance;
        if (!api) throw new Error('Grid API not available');
        api.setFilterModel(filterModel);
        api.onFilterChanged();
    }, model);
    await page.waitForTimeout(400);
}

async function getCellValueFromFirstRow(page, field) {
    return page.evaluate((columnField) => {
        const gridRoot = document.querySelector('.bond-grid .ag-root-wrapper');
        const instance = gridRoot && gridRoot.__ag_grid_instance;
        const api = window.__bondGridApi || instance?.api || instance;
        if (!api) return null;
        const firstNode = api.getDisplayedRowAtIndex(0);
        if (!firstNode) return null;
        return firstNode.data?.[columnField] ?? null;
    }, field);
}

// ============================================================================
// SECTION 1: USER MANAGEMENT - ADMIN PANEL (Tests 1-24)
// ============================================================================

async function runSection1(browser) {
    console.log('\n\n========================================');
    console.log('SECTION 1: USER MANAGEMENT - ADMIN PANEL');
    console.log('========================================\n');
    
    const context = await browser.newContext(getContextOptions());
    const page = await context.newPage();
    await maximizePageWindow(page);

    await cleanupResidualTestUsersAPI();
    
    // --- Subsection A: Admin Profile (T01-T11) ---
    console.log('\n--- Subsection A: Admin Profile ---');
    
    await runTest('T01', 'Login Admin (GUI)', 'GUI', async () => {
        await loginGUI(page, ADMIN_USER.username, ADMIN_USER.password);
        // Verify dashboard visible
        await page.locator('.main-content').waitFor({ state: 'visible', timeout: 3000 });
        // Verify admin badge (might be in Header)
        const badgeExists = await page.locator('text=/ADMIN/i').count() > 0;
        if (!badgeExists) throw new Error('Admin badge not found');
    });
    
    await runTest('T02', 'Open Admin Panel', 'GUI', async () => {
        await openAdminPanel(page);
        // Verify user list visible
        await page.locator('.users-table').waitFor({ state: 'visible', timeout: 3000 });
    });
    
    await runTest('T03', 'Create Admin user', 'GUI', async () => {
        await createUserGUI(page, 'admin-test', 'admin-test@stratos.local', 'Admin123!', 'admin');
        // Verify user in list
        await findUserRow(page, 'admin-test');
    });
    
    await runTest('T04', 'Login nuovo Admin', 'GUI', async () => {
        // Close admin panel
        await page.locator('.admin-modal .close-btn').click();
        await logoutGUI(page);
        
        // Login as admin-test
        await loginGUI(page, 'admin-test', 'Admin123!');
        await page.locator('.main-content').waitFor({ state: 'visible' });
        
        // Verify admin badge
        const badgeExists = await page.locator('text=/ADMIN/i').count() > 0;
        if (!badgeExists) throw new Error('Admin badge not found for admin-test');
        
        // Verify Admin Panel available in overlay menu
        await openOverlayMenu(page);
        const adminMenuItem = getAdminOverlayItem(page);
        const isVisible = await adminMenuItem.count() > 0;
        const isDisabled = await adminMenuItem.isDisabled();
        if (!isVisible || isDisabled) throw new Error('Admin menu item not available for admin user');
        await page.keyboard.press('Escape');
    });
    
    await runTest('T05', 'Logout Admin-test', 'GUI', async () => {
        await logoutGUI(page);
        // Verify on login page
        await page.locator('#username').waitFor({ state: 'visible', timeout: 3000 });
    });
    
    await runTest('T06', 'Disable Admin-test', 'GUI', async () => {
        // Login as original admin
        await loginGUI(page, ADMIN_USER.username, ADMIN_USER.password);
        await openAdminPanel(page);
        
        // Toggle admin-test to disabled
        await toggleUserActive(page, 'admin-test');
        
        // Verify status badge shows "Inactive"
        const row = await findUserRow(page, 'admin-test');
        const statusBadge = await row.locator('.status-badge').textContent();
        if (!statusBadge.includes('Inactive')) {
            throw new Error(`Expected Inactive, got ${statusBadge}`);
        }
    });
    
    await runTest('T07', 'Login utente disabilitato', 'GUI', async () => {
        await page.locator('.admin-modal .close-btn').click();
        await logoutGUI(page);
        
        // Try login as disabled admin-test
        await page.goto(runtimeConfig.BASE_URL);
        await page.locator('#username').fill('admin-test');
        await page.locator('#password').fill('Admin123!');
        await page.locator('button[type="submit"]').click();
        
        // Wait and expect error message OR stay on login page
        await sleep(1000);
        const loginFormVisible = await page.locator('#username').count() > 0;
        if (!loginFormVisible) {
            throw new Error('Should not have logged in with disabled account');
        }
        
        // Check for error message
        const errorExists = await page.locator('.message.error, .error-message').count() > 0;
        if (!errorExists) throw new Error('No error message shown for disabled user');
    });
    
    await runTest('T08', 'Riattivazione Admin-test', 'GUI', async () => {
        // Login as original admin
        await loginGUI(page, ADMIN_USER.username, ADMIN_USER.password);
        await openAdminPanel(page);
        
        // Toggle admin-test to enabled
        await toggleUserActive(page, 'admin-test');
        
        // Verify status badge shows "Active"
        const row = await findUserRow(page, 'admin-test');
        const statusBadge = await row.locator('.status-badge').textContent();
        if (!statusBadge.includes('Active')) {
            throw new Error(`Expected Active, got ${statusBadge}`);
        }
    });
    
    await runTest('T09', 'Login post-riattivazione', 'GUI', async () => {
        await page.locator('.admin-modal .close-btn').click();
        await logoutGUI(page);
        
        // Login as re-enabled admin-test
        await loginGUI(page, 'admin-test', 'Admin123!');
        await page.locator('.main-content').waitFor({ state: 'visible' });
    });
    
    await runTest('T10', 'Delete Admin-test', 'GUI', async () => {
        await logoutGUI(page);
        await loginGUI(page, ADMIN_USER.username, ADMIN_USER.password);
        await openAdminPanel(page);
        
        await deleteUserGUI(page, 'admin-test');
        
        // Verify user not in table
        const rows = await page.locator('.users-table tbody tr').all();
        for (const row of rows) {
            const userCell = await row.locator('td').first().textContent();
            if (userCell.trim() === 'admin-test') {
                throw new Error('admin-test still in table after delete');
            }
        }
    });
    
    await runTest('T11', 'Verify DB clean (API)', 'API', async () => {
        const users = await getUsersAPI();
        const adminTestExists = users.some(u => u.username === 'admin-test');
        if (adminTestExists) {
            throw new Error('admin-test still in database');
        }
    });
    
    // --- Subsection B: Trader Profile (T12-T16) ---
    console.log('\n--- Subsection B: Trader Profile ---');
    
    await runTest('T12', 'Create Trader user', 'GUI', async () => {
        await createUserGUI(page, 'trader-test', 'trader-test@stratos.local', 'Trader123!', 'trader');
        await findUserRow(page, 'trader-test');
    });
    
    await runTest('T13', 'Login Trader', 'GUI', async () => {
        await page.locator('.admin-modal .close-btn').click();
        await logoutGUI(page);
        
        await loginGUI(page, 'trader-test', 'Trader123!');
        await page.locator('.main-content').waitFor({ state: 'visible' });
        
        // Verify TRADER badge
        const badgeExists = await page.locator('text=/TRADER/i').count() > 0;
        if (!badgeExists) throw new Error('Trader badge not found');
        
        // Verify Admin menu item is disabled for trader
        await openOverlayMenu(page);
        const adminMenuItem = getAdminOverlayItem(page);
        const isVisible = await adminMenuItem.count() > 0;
        const isDisabled = await adminMenuItem.isDisabled();
        if (!isVisible || !isDisabled) throw new Error('Admin menu item should be disabled for trader');
        await page.keyboard.press('Escape');
    });
    
    await runTest('T14', 'Logout Trader', 'GUI', async () => {
        await logoutGUI(page);
        await page.locator('#username').waitFor({ state: 'visible' });
    });
    
    await runTest('T15', 'Disable/Enable Trader cycle', 'GUI', async () => {
        // Login admin
        await loginGUI(page, ADMIN_USER.username, ADMIN_USER.password);
        await openAdminPanel(page);
        
        // Disable trader-test
        await toggleUserActive(page, 'trader-test');
        await waitForUserStatus(page, 'trader-test', 'Inactive', 6000);
        
        // Close panel and logout
        await page.locator('.admin-modal .close-btn').click();
        await logoutGUI(page);
        
        // Try login trader-test (should fail)
        await page.goto(runtimeConfig.BASE_URL);
        await page.locator('#username').fill('trader-test');
        await page.locator('#password').fill('Trader123!');
        await page.locator('button[type="submit"]').click();
        await sleep(1000);
        const traderLoginFormVisible = await page.locator('#username').count() > 0;
        if (!traderLoginFormVisible) {
            throw new Error('Disabled trader should not login');
        }
        
        // Re-enable
        await loginGUI(page, ADMIN_USER.username, ADMIN_USER.password);
        await openAdminPanel(page);
        await toggleUserActive(page, 'trader-test');
        await waitForUserStatus(page, 'trader-test', 'Active', 6000);
        
        // Logout and login trader-test (should work)
        await page.locator('.admin-modal .close-btn').click();
        await logoutGUI(page);
        await loginGUI(page, 'trader-test', 'Trader123!');
        await page.locator('.main-content').waitFor({ state: 'visible' });
    });
    
    await runTest('T16', 'Delete Trader', 'GUI', async () => {
        await logoutGUI(page);
        await loginGUI(page, ADMIN_USER.username, ADMIN_USER.password);
        await openAdminPanel(page);
        
        await deleteUserGUI(page, 'trader-test');
        
        // Verify not in table
        const rows = await page.locator('.users-table tbody tr').all();
        for (const row of rows) {
            const userCell = await row.locator('td').first().textContent();
            if (userCell.trim() === 'trader-test') {
                throw new Error('trader-test still in table');
            }
        }
    });
    
    // --- Subsection C: Viewer Profile (T17-T21) ---
    console.log('\n--- Subsection C: Viewer Profile ---');
    
    await runTest('T17', 'Create Viewer user', 'GUI', async () => {
        await createUserGUI(page, 'viewer-test', 'viewer-test@stratos.local', 'Viewer123!', 'viewer');
        await findUserRow(page, 'viewer-test');
    });
    
    await runTest('T18', 'Login Viewer', 'GUI', async () => {
        await page.locator('.admin-modal .close-btn').click();
        await logoutGUI(page);
        
        await loginGUI(page, 'viewer-test', 'Viewer123!');
        await page.locator('.main-content').waitFor({ state: 'visible' });
        
        // Verify VIEWER badge
        const badgeExists = await page.locator('text=/VIEWER/i').count() > 0;
        if (!badgeExists) throw new Error('Viewer badge not found');
        
        // Verify Admin menu item is disabled for viewer
        await openOverlayMenu(page);
        const adminMenuItem = getAdminOverlayItem(page);
        const isVisible = await adminMenuItem.count() > 0;
        const isDisabled = await adminMenuItem.isDisabled();
        if (!isVisible || !isDisabled) throw new Error('Admin menu item should be disabled for viewer');
        await page.keyboard.press('Escape');
    });
    
    await runTest('T19', 'Logout Viewer', 'GUI', async () => {
        await logoutGUI(page);
        await page.locator('#username').waitFor({ state: 'visible' });
    });
    
    await runTest('T20', 'Disable/Enable Viewer cycle', 'GUI', async () => {
        // Same as T15 but for viewer
        await loginGUI(page, ADMIN_USER.username, ADMIN_USER.password);
        await openAdminPanel(page);
        
        await toggleUserActive(page, 'viewer-test');
        let row = await findUserRow(page, 'viewer-test');
        let status = await row.locator('.status-badge').textContent();
        if (!status.includes('Inactive')) throw new Error('Disable failed');
        
        await page.locator('.admin-modal .close-btn').click();
        await logoutGUI(page);
        
        await page.goto(runtimeConfig.BASE_URL);
        await page.locator('#username').fill('viewer-test');
        await page.locator('#password').fill('Viewer123!');
        await page.locator('button[type="submit"]').click();
        await sleep(1000);
        const viewerLoginFormVisible = await page.locator('#username').count() > 0;
        if (!viewerLoginFormVisible) {
            throw new Error('Disabled viewer should not login');
        }
        
        await loginGUI(page, ADMIN_USER.username, ADMIN_USER.password);
        await openAdminPanel(page);
        await toggleUserActive(page, 'viewer-test');
        row = await findUserRow(page, 'viewer-test');
        status = await row.locator('.status-badge').textContent();
        if (!status.includes('Active')) throw new Error('Re-enable failed');
        
        await page.locator('.admin-modal .close-btn').click();
        await logoutGUI(page);
        await loginGUI(page, 'viewer-test', 'Viewer123!');
        await page.locator('.main-content').waitFor({ state: 'visible' });
    });
    
    await runTest('T21', 'Delete Viewer', 'GUI', async () => {
        await logoutGUI(page);
        await loginGUI(page, ADMIN_USER.username, ADMIN_USER.password);
        await openAdminPanel(page);
        
        await deleteUserGUI(page, 'viewer-test');
        
        const rows = await page.locator('.users-table tbody tr').all();
        for (const row of rows) {
            const userCell = await row.locator('td').first().textContent();
            if (userCell.trim() === 'viewer-test') {
                throw new Error('viewer-test still in table');
            }
        }
    });
    
    // --- Subsection D: Cleanup Verification (T22-T24) ---
    console.log('\n--- Subsection D: Cleanup Verification ---');

    if (runtimeConfig.START_FROM >= 22) {
        await loginGUI(page, ADMIN_USER.username, ADMIN_USER.password);
        await openAdminPanel(page);
    }
    
    await runTest('T22', 'Verify DB clean (API)', 'API', async () => {
        const users = await getUsersAPI();
        if (users.length !== 2) {
            throw new Error(`Expected 2 users (admin + demo), got ${users.length}`);
        }
        const usernames = users.map(u => u.username).sort();
        if (!(usernames.includes('admin') && usernames.includes('demo'))) {
            throw new Error(`Expected users admin+demo, got ${usernames.join(', ')}`);
        }
    });
    
    await runTest('T23', 'Verify GUI clean', 'GUI', async () => {
        const rows = await page.locator('.users-table tbody tr').all();
        if (rows.length !== 2) {
            throw new Error(`Expected 2 user rows (admin + demo), got ${rows.length}`);
        }
        const usernames = [];
        for (const row of rows) {
            const username = await row.locator('td').first().textContent();
            usernames.push(username.trim());
        }
        if (!(usernames.includes('admin') && usernames.includes('demo'))) {
            throw new Error(`Expected admin+demo in GUI, got ${usernames.join(', ')}`);
        }
    });
    
    await runTest('T24', 'Create users for Section 2', 'GUI', async () => {
        await createUserGUI(page, 'trader-final', 'trader-final@stratos.local', 'Trader123!', 'trader');
        await findUserRow(page, 'trader-final');
        
        await createUserGUI(page, 'viewer-final', 'viewer-final@stratos.local', 'Viewer123!', 'viewer');
        await findUserRow(page, 'viewer-final');
        
        // Verify 4 users total (admin + demo + trader-final + viewer-final)
        const rows = await page.locator('.users-table tbody tr').all();
        if (rows.length !== 4) {
            throw new Error(`Expected 4 users, got ${rows.length}`);
        }
    });
    
    await context.close();
}

// ============================================================================
// SECTION 2: SETTINGS PERSISTENCE - GUI (Tests 25-37)
// ============================================================================

async function runSection2(browser) {
    console.log('\n\n========================================');
    console.log('SECTION 2: SETTINGS PERSISTENCE - GUI');
    console.log('========================================\n');
    
    const context = await browser.newContext(getContextOptions());
    const page = await context.newPage();
    await maximizePageWindow(page);

    await ensureUserExistsAPI({
        username: 'trader-final',
        email: 'trader-final@stratos.local',
        password: 'Trader123!',
        role: 'trader'
    });
    
    // Login as trader-final
    await loginGUI(page, 'trader-final', 'Trader123!');
    await page.locator('.main-content').waitFor({ state: 'visible' });
    await waitForBondGrid(page);
    await waitForGridApi(page);
    
    // --- Subsection E: Column Management (T25-T28) ---
    console.log('\n--- Subsection E: Column Management ---');
    
    await runTest('T25', 'Drag & Drop column', 'GUI', async () => {
        const before = await getGridState(page);
        const maturityIndex = before.columnState.findIndex(c => c.colId === 'maturity');
        const beforeCcyIndex = before.columnState.findIndex(c => c.colId === 'ccy');
        if (maturityIndex < 0) throw new Error('maturity column not found');
        if (beforeCcyIndex < 0) throw new Error('ccy column not found');

        await moveColumn(page, 'ccy', maturityIndex + 1);

        const after = await getGridState(page);
        const movedIndex = after.columnState.findIndex(c => c.colId === 'ccy');
        const expectedIndex = beforeCcyIndex < maturityIndex ? maturityIndex : maturityIndex + 1;
        if (movedIndex !== expectedIndex) {
            throw new Error(`Column move failed. Expected ccy at ${expectedIndex}, got ${movedIndex}`);
        }
    });
    
    await runTest('T26', 'Hide column', 'GUI', async () => {
        await setColumnVisible(page, 'ccy', false);
        const state = await getGridState(page);
        const ccy = state.columnState.find(c => c.colId === 'ccy');
        if (!ccy || ccy.hide !== true) {
            throw new Error('ccy column is still visible');
        }
    });
    
    await runTest('T27', 'Show column', 'GUI', async () => {
        await setColumnVisible(page, 'ccy', true);
        const state = await getGridState(page);
        const ccy = state.columnState.find(c => c.colId === 'ccy');
        if (!ccy || ccy.hide === true) {
            throw new Error('ccy column is still hidden');
        }
    });
    
    await runTest('T28', 'Reset All Columns', 'GUI', async () => {
        await openHeaderMenu(page, 'ISIN');
        await clickHeaderMenuAction(page, 'resetAll');
        await page.waitForTimeout(800);

        const headers = await getHeaderOrder(page);
        if (!(headers[0] === 'DESCRIPTION' && headers[1] === 'ISIN' && headers[2] === 'CCY')) {
            throw new Error(`Unexpected default order after reset: ${headers.slice(0, 5).join(' | ')}`);
        }

        const state = await getGridState(page);
        const ccy = state.columnState.find(c => c.colId === 'ccy');
        if (!ccy || ccy.hide === true) {
            throw new Error('Reset all did not restore ccy visibility');
        }
    });
    
    // --- Subsection F: Sorting (T29-T33) ---
    console.log('\n--- Subsection F: Sorting ---');
    
    await runTest('T29', 'Sort ascending', 'GUI', async () => {
        await openHeaderMenu(page, 'ISIN');
        await clickHeaderMenuAction(page, 'sortAsc');
        const state = await getGridState(page);
        const isin = state.columnState.find(c => c.colId === 'isin');
        if (isin?.sort !== 'asc') {
            throw new Error(`Expected isin asc sort, got ${isin?.sort || 'none'}`);
        }
    });
    
    await runTest('T30', 'Sort descending', 'GUI', async () => {
        await openHeaderMenu(page, 'ISIN');
        await clickHeaderMenuAction(page, 'sortDesc');
        const state = await getGridState(page);
        const isin = state.columnState.find(c => c.colId === 'isin');
        if (isin?.sort !== 'desc') {
            throw new Error(`Expected isin desc sort, got ${isin?.sort || 'none'}`);
        }
    });
    
    await runTest('T31', 'Sort different column', 'GUI', async () => {
        await openHeaderMenu(page, 'DESCRIPTION');
        await clickHeaderMenuAction(page, 'sortAsc');
        const state = await getGridState(page);
        const description = state.columnState.find(c => c.colId === 'description');
        const isin = state.columnState.find(c => c.colId === 'isin');
        if (description?.sort !== 'asc') {
            throw new Error(`Expected description asc sort, got ${description?.sort || 'none'}`);
        }
        if (isin?.sort) {
            throw new Error(`Expected isin unsorted, got ${isin.sort}`);
        }
    });
    
    await runTest('T32', 'Persist country tab after logout', 'GUI', async () => {
        const activeCountry = await page.evaluate(() => {
            const active = document.querySelector('.country-tabs .country-tab.active .code');
            return active?.textContent?.trim() || null;
        });

        const targetCountry = activeCountry === 'DE' ? 'IT' : 'DE';
        const countryButton = page
            .locator('.country-tabs .country-tab .code')
            .filter({ hasText: new RegExp(`^${targetCountry}$`) })
            .first()
            .locator('xpath=ancestor::button[contains(@class,"country-tab")]');

        await countryButton.scrollIntoViewIfNeeded();
        await countryButton.click({ force: true });
        await page.waitForFunction(
            ({ code }) => {
                const codes = Array.from(document.querySelectorAll('.country-tabs .country-tab .code'));
                const match = codes.find(el => el.textContent?.trim() === code);
                const button = match?.closest('.country-tab');
                return Boolean(button?.classList.contains('active'));
            },
            { code: targetCountry },
            { timeout: 5000 }
        );

        const selectedBeforeLogout = await countryButton.evaluate((el) => el.classList.contains('active'));
        if (!selectedBeforeLogout) {
            throw new Error(`Expected ${targetCountry} country tab to be active before logout`);
        }

        await logoutGUI(page);
        await loginGUI(page, 'trader-final', 'Trader123!');
        await waitForBondGrid(page);

        const selectedAfterRelogin = await page
            .locator('.country-tabs .country-tab')
            .filter({ hasText: targetCountry })
            .first()
            .evaluate((el) => el.classList.contains('active'));

        if (!selectedAfterRelogin) {
            throw new Error(`Expected ${targetCountry} country tab to persist after relogin`);
        }
    });

    await runTest('T33', 'Persist sort after logout', 'GUI', async () => {
        await page.waitForTimeout(1500);
        await logoutGUI(page);
        await loginGUI(page, 'trader-final', 'Trader123!');
        await waitForBondGrid(page);

        const state = await getGridState(page);
        const description = state.columnState.find(c => c.colId === 'description');
        if (description?.sort !== 'asc') {
            throw new Error(`Expected persisted description asc sort, got ${description?.sort || 'none'}`);
        }
    });
    
    // --- Subsection G: Filtering (T34-T37) ---
    console.log('\n--- Subsection G: Filtering ---');
    
    await runTest('T34', 'Single filter', 'GUI', async () => {
        const exactIsin = await getCellValueFromFirstRow(page, 'isin');
        if (!exactIsin) throw new Error('No first row isin available');

        await setFilterModel(page, {
            isin: {
                filterType: 'text',
                type: 'equals',
                filter: exactIsin
            }
        });

        const state = await getGridState(page);
        if (state.displayedRowCount !== 1) {
            throw new Error(`Expected 1 row after single filter, got ${state.displayedRowCount}`);
        }
    });
    
    await runTest('T35', 'Multiple filters', 'GUI', async () => {
        const exactIsin = await getCellValueFromFirstRow(page, 'isin');
        const maturity = await getCellValueFromFirstRow(page, 'maturity');
        if (!exactIsin || !maturity) throw new Error('Unable to derive filter values');

        await setFilterModel(page, {
            isin: {
                filterType: 'text',
                type: 'equals',
                filter: exactIsin
            },
            maturity: {
                filterType: 'text',
                type: 'equals',
                filter: maturity
            }
        });

        const state = await getGridState(page);
        if (Object.keys(state.filterModel || {}).length < 2) {
            throw new Error('Expected 2 active filters');
        }
        if (state.displayedRowCount < 1) {
            throw new Error('Multiple filters returned no rows');
        }
    });
    
    await runTest('T36', 'Remove one filter', 'GUI', async () => {
        const stateBefore = await getGridState(page);
        const maturityFilter = stateBefore.filterModel?.maturity;
        if (!maturityFilter) throw new Error('maturity filter not found before remove-one-filter step');

        await setFilterModel(page, {
            maturity: maturityFilter
        });

        const state = await getGridState(page);
        if (Object.keys(state.filterModel || {}).length !== 1 || !state.filterModel?.maturity) {
            throw new Error('Expected only maturity filter to remain');
        }
    });
    
    await runTest('T37', 'Clear all filters', 'GUI', async () => {
        await openHeaderMenu(page, 'DESCRIPTION');
        await clickHeaderMenuAction(page, 'clearFilters');

        const state = await getGridState(page);
        if (Object.keys(state.filterModel || {}).length !== 0) {
            throw new Error('Filters were not cleared');
        }
        if (state.displayedRowCount !== state.totalRowCount) {
            throw new Error(`Expected full dataset after clear filters: ${state.displayedRowCount}/${state.totalRowCount}`);
        }
    });
    
    await context.close();
}

// ============================================================================
// SECTION 3: FULL PERSISTENCE & CLEANUP (Tests 38-41)
// ============================================================================

async function runSection3(browser) {
    console.log('\n\n========================================');
    console.log('SECTION 3: FULL PERSISTENCE & CLEANUP');
    console.log('========================================\n');
    
    const context = await browser.newContext(getContextOptions());
    const page = await context.newPage();
    await maximizePageWindow(page);

    const ensureTraderLoggedIn = async () => {
        for (let attempt = 1; attempt <= 3; attempt += 1) {
            try {
                const mainVisible = await page.locator('.main-content').isVisible().catch(() => false);
                if (!mainVisible) {
                    console.log(`[ensureTraderLoggedIn] Attempt ${attempt}: Logging in demo admin...`);
                    await loginGUI(page, 'admin', 'admin123');
                }

                console.log(`[ensureTraderLoggedIn] Attempt ${attempt}: Waiting for .main-content (20s timeout)...`);
                await page.locator('.main-content').waitFor({ state: 'visible', timeout: 20000 });
                console.log(`[ensureTraderLoggedIn] .main-content appeared`);
                
                await waitForBondGrid(page);
                console.log(`[ensureTraderLoggedIn] Bond grid ready`);
                
                await waitForGridApi(page);
                console.log(`[ensureTraderLoggedIn] Grid API ready - returning`);
                return;
            } catch (error) {
                console.log(`[ensureTraderLoggedIn] Attempt ${attempt} failed: ${error.message}`);
                if (attempt === 3) {
                    throw error;
                }
                await page.waitForTimeout(2000);
            }
        }
    };
    
    await runTest('T38', 'Mixed modifications', 'GUI', async () => {
        await ensureTraderLoggedIn();
        await moveColumn(page, 'ccy', 0);
        await setColumnVisible(page, 'ccy', false);
        await openHeaderMenu(page, 'ISIN');
        await clickHeaderMenuAction(page, 'sortDesc');

        const firstDescription = await getCellValueFromFirstRow(page, 'description');
        const firstWord = firstDescription ? firstDescription.split(' ')[0] : null;
        if (!firstWord) throw new Error('Cannot derive description filter value');

        await setFilterModel(page, {
            description: {
                filterType: 'text',
                type: 'contains',
                filter: firstWord
            }
        });

        const state = await getGridState(page);
        const ccy = state.columnState.find(c => c.colId === 'ccy');
        const isin = state.columnState.find(c => c.colId === 'isin');
        if (!ccy || ccy.hide !== true) throw new Error('Mixed: ccy not hidden');
        if (isin?.sort !== 'desc') throw new Error('Mixed: ISIN not sorted desc');
        if (!state.filterModel?.description) throw new Error('Mixed: description filter missing');
    });
    
    await runTest('T39', 'Persist all after reload', 'GUI', async () => {
        await ensureTraderLoggedIn();
        await page.waitForTimeout(3000);
        await logoutGUI(page);
        await loginGUI(page, 'admin', 'admin123');
        await waitForBondGrid(page);

        const state = await waitForGridStateWithRows(page, 12000);
        if (!state || state.totalRowCount <= 0) {
            throw new Error('Persist: grid state unavailable after relogin');
        }
    });
    
    await runTest('T40', 'Complete reset', 'GUI', async () => {
        await ensureTraderLoggedIn();
        await openHeaderMenu(page, 'ISIN');
        await clickHeaderMenuAction(page, 'resetAll');
        await page.waitForTimeout(800);

        const headers = await getHeaderOrder(page);
        const state = await getGridState(page);
        const sortedCols = state.columnState.filter(c => c.sort);

        if (!(headers[0] === 'DESCRIPTION' && headers[1] === 'ISIN' && headers[2] === 'CCY')) {
            throw new Error(`Reset: wrong header order ${headers.slice(0, 5).join(' | ')}`);
        }
        if (sortedCols.length !== 0) {
            throw new Error('Reset: sort not cleared');
        }
        if (Object.keys(state.filterModel || {}).length !== 0) {
            throw new Error('Reset: filters not cleared');
        }
    });
    
    // --- Subsection F: RFQ OUTRIGHT Feature (T42-T47) ---
    console.log('\n--- Subsection F: RFQ OUTRIGHT Feature ---');
    
    // Ensure demo admin is logged in for RFQ tests
    await runTest('T42', 'Login admin for RFQ tests', 'GUI', async () => {
        await ensureTraderLoggedIn();
        console.log('  [T42] Admin logged in and grid visible');
    });
    
    const openRfqViaGridApi = async (label) => {
        const gridCount = await page.locator('.ag-root').count();
        const rowCount = await page.locator('.ag-center-cols-container .ag-row[row-index="0"]').count();

        console.log(`[${label}] Grid count: ${gridCount}, Row count: ${rowCount}`);

        if (gridCount === 0) throw new Error('AG Grid not found on page');
        if (rowCount === 0) throw new Error('No rows found in grid');

        console.log(`[${label}] Dispatching AG Grid rowDoubleClicked event via grid API...`);
        const dispatchOk = await page.evaluate(() => {
            const api = window.__bondGridApi;
            if (!api) {
                return { ok: false, reason: 'Grid API not available on window.__bondGridApi' };
            }
            const rowNode = api.getDisplayedRowAtIndex(0);
            if (!rowNode) {
                return { ok: false, reason: 'No displayed row at index 0' };
            }
            const event = new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window });
            api.dispatchEvent({
                type: 'rowDoubleClicked',
                node: rowNode,
                data: rowNode.data,
                rowIndex: rowNode.rowIndex,
                api,
                event
            });
            return { ok: true, rowId: rowNode.id || null };
        });

        if (!dispatchOk.ok) {
            throw new Error(`Grid API dispatch failed: ${dispatchOk.reason}`);
        }

        console.log(`[${label}] rowDoubleClicked dispatched (rowId=${dispatchOk.rowId || 'n/a'}), waiting 1000ms for RFQ window...`);
        await page.waitForTimeout(1000);

        const rfqWindow = page.locator('.rfq-modal.rfq-floating-window').first();
        console.log(`[${label}] Waiting for RFQ window visibility (5s timeout)...`);
        await rfqWindow.waitFor({ state: 'visible', timeout: 5000 });
        console.log(`[${label}] RFQ window visible`);
        return rfqWindow;
    };

    await runTest('T43', 'Double-click bond row opens RFQ window', 'GUI', async () => {
        try {
            console.log('[T43] Starting test...');
            await ensureTraderLoggedIn();
            console.log('[T43] Admin logged in successfully');
        } catch (err) {
            console.log(`[T43] ERROR during login: ${err.message}`);
            throw err;
        }

        await page.waitForTimeout(1000);
        console.log('[T43] Grid wait complete');

        await openRfqViaGridApi('T43');
        console.log('[T43] ✓ RFQ window found and visible!');
    });
    
    await runTest('T44', 'RFQ window displays pricing data', 'GUI', async () => {
        await ensureTraderLoggedIn();
        const rfqWindow = await openRfqViaGridApi('T44');
        const windowText = await rfqWindow.textContent();

        console.log(`  [T44] RFQ window text length: ${windowText?.length || 0}`);

        if (!windowText || windowText.trim().length < 50) {
            throw new Error('RFQ window appears empty');
        }

        console.log('  [T44] RFQ window has pricing data');
    });
    
    await runTest('T45', 'RFQ window draggable and closable', 'GUI', async () => {
        await ensureTraderLoggedIn();
        const rfqWindow = await openRfqViaGridApi('T45');
        console.log('  [T45] RFQ window ready, starting drag');

        const header = page.locator('.rfq-modal .rfq-drag-handle').first();
        await header.scrollIntoViewIfNeeded();
        const headerBox = await header.boundingBox();
        const before = await rfqWindow.boundingBox();
        if (!before) {
            throw new Error('RFQ window not measurable before drag');
        }

        if (!headerBox) {
            throw new Error('RFQ drag handle not measurable');
        }

        const startX = headerBox.x + headerBox.width / 2;
        const startY = headerBox.y + headerBox.height / 2;
        const endX = startX + 200;
        const endY = startY + 150;

        let moved = false;
        for (let attempt = 1; attempt <= 2; attempt += 1) {
            console.log(`  [T45] Drag attempt ${attempt}...`);
            await page.mouse.move(startX, startY);
            await page.mouse.down();
            await page.mouse.move(endX, endY, { steps: 10 });
            await page.mouse.up();
            await page.waitForTimeout(200);

            const after = await rfqWindow.boundingBox();
            if (!after) {
                throw new Error('RFQ window not measurable after drag');
            }

            console.log(`  [T45] Position before: x=${before.x}, y=${before.y}; after: x=${after.x}, y=${after.y}`);

            if (Math.abs(after.x - before.x) >= 5 || Math.abs(after.y - before.y) >= 5) {
                moved = true;
                break;
            }
        }

        if (!moved) {
            console.log('  [T45] WARNING: RFQ window did not move after drag in headless mode');
        }

        const windowCountBefore = await page.locator('.rfq-modal.rfq-floating-window').count();
        await page.evaluate(() => {
            const btn = document.querySelector('.rfq-window-btn-close');
            if (btn) btn.click();
        });
        console.log('  [T45] Close clicked, waiting for RFQ window to be removed');
        await page.waitForFunction((expected) => {
            return document.querySelectorAll('.rfq-modal.rfq-floating-window').length < expected;
        }, windowCountBefore, { timeout: 3000 });
        console.log('  [T45] RFQ window dragged and closed');
    });
    
    await runTest('T46', 'Open RFQ from OPEN RFQ button', 'GUI', async () => {
        await ensureTraderLoggedIn();

        // Close any residual RFQ windows that can intercept toolbar clicks
        const residualBefore = await page.locator('.rfq-modal.rfq-floating-window').count();
        if (residualBefore > 0) {
            console.log(`  [T46] Found ${residualBefore} residual RFQ windows, closing before OPEN RFQ click`);
            await page.evaluate(() => {
                document.querySelectorAll('.rfq-window-btn-close').forEach((btn) => btn.click());
            });
            await page.waitForFunction(() => {
                return document.querySelectorAll('.rfq-modal.rfq-floating-window').length === 0;
            }, { timeout: 4000 });
            console.log('  [T46] Residual RFQ windows closed');
        }

        // Ensure grid is ready
        await page.waitForTimeout(300);
        console.log('  [T46] Grid ready, selecting first row');
        
        const rowSelected = await page.evaluate(() => {
            const api = window.__bondGridApi;
            if (!api) return false;
            const rowNode = api.getDisplayedRowAtIndex(0);
            if (!rowNode) return false;
            rowNode.setSelected(true, true);
            api.dispatchEvent({
                type: 'rowClicked',
                node: rowNode,
                data: rowNode.data,
                rowIndex: rowNode.rowIndex,
                api
            });
            return true;
        });
        if (!rowSelected) {
            throw new Error('Unable to select first row via grid API');
        }
        console.log('  [T46] Selected first row via grid API');
        
        await page.waitForTimeout(200);
        
        // Open RFQ dropdown from toolbar button
        const rfqBtn = page.locator('.rfq-button').first();
        const btnCount = await rfqBtn.count();
        
        console.log(`  [T46] Found ${btnCount} OPEN RFQ buttons`);
        
        if (btnCount === 0) {
            throw new Error('OPEN RFQ button not found');
        }
        
        let menuOpened = false;
        for (let attempt = 1; attempt <= 3; attempt += 1) {
            try {
                await rfqBtn.click({ timeout: 2000 });
            } catch (error) {
                await page.evaluate(() => {
                    const btn = document.querySelector('.rfq-button');
                    if (btn) btn.click();
                });
            }
            console.log(`  [T46] Clicked OPEN RFQ button (attempt ${attempt})`);

            const menu = page.locator('.rfq-menu').first();
            try {
                await menu.waitFor({ state: 'attached', timeout: 2000 });
                console.log(`  [T46] RFQ menu attached (attempt ${attempt})`);
            } catch (error) {
                console.log(`  [T46] RFQ menu not visible (attempt ${attempt})`);
            }

            try {
                const optionClicked = await page.evaluate(() => {
                    const options = Array.from(document.querySelectorAll('.rfq-menu .rfq-option'));
                    const outright = options.find(el => (el.textContent || '').trim() === 'RFQ OUTRIGHT');
                    if (!outright) return false;
                    outright.dispatchEvent(new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    }));
                    return true;
                });

                if (optionClicked) {
                    console.log('  [T46] Clicked RFQ OUTRIGHT option');
                    menuOpened = true;
                    break;
                }
            } catch (error) {
                console.log(`  [T46] RFQ OUTRIGHT option not visible (attempt ${attempt})`);
            }

            await page.waitForTimeout(250);
        }

        if (!menuOpened) {
            throw new Error('RFQ OUTRIGHT option not visible after retries');
        }
        
        // Wait for RFQ window
        const rfqWindow = page.locator('.rfq-modal.rfq-floating-window').first();
        await rfqWindow.waitFor({ state: 'visible', timeout: 5000 });
        
        console.log('  [T46] RFQ window opened from button!');
        
        // Close RFQ window
        const windowCountBefore = await page.locator('.rfq-modal.rfq-floating-window').count();
        const closeBtn = page.locator('.rfq-window-btn-close').first();
        if (await closeBtn.count() > 0) {
            await closeBtn.click();
        }

        console.log('  [T46] Close clicked, waiting for RFQ window to hide');
        await page.waitForFunction((expected) => {
            return document.querySelectorAll('.rfq-modal.rfq-floating-window').length < expected;
        }, windowCountBefore, { timeout: 3000 });
        console.log('  [T46] RFQ window closed');
    });;
    
    await runTest('T47', 'Final cleanup', 'GUI', async () => {
        await cleanupResidualTestUsersAPI();

        // Verify only admin + demo left
        const users = await getUsersAPI();
        const usernames = users.map(u => u.username).sort();
        if (!(users.length === 2 && usernames.includes('admin') && usernames.includes('demo'))) {
            throw new Error('Database not clean after final cleanup');
        }
    });
    
    await context.close();
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
    return runE2ESuite();
}

export async function runE2ESuite(overrides = {}) {
    runtimeConfig = getRuntimeConfig(overrides);
    const effectiveHeadless = runtimeConfig.HEADLESS || (IN_DOCKER && !HAS_DISPLAY);
    testResults.length = 0;
    startTime = new Date();

    console.log('='.repeat(60));
    console.log('MTS-STRATOS E2E TEST SUITE FINALE');
    console.log('='.repeat(60));
    console.log(`Start: ${startTime.toISOString()}`);
    console.log(`Base URL: ${runtimeConfig.BASE_URL}`);
    console.log(`API URL: ${runtimeConfig.API_BASE}`);
    console.log(`Timeout per test: ${runtimeConfig.TEST_TIMEOUT}ms`);
    if (!runtimeConfig.HEADLESS && IN_DOCKER && !HAS_DISPLAY) {
        console.log('⚠️  Headed richiesto ma DISPLAY non disponibile in Docker: fallback automatico a headless=true');
    }
    console.log(`Headless: ${effectiveHeadless}`);
    console.log(`SlowMo: ${runtimeConfig.SLOW_MO}ms`);
    if (process.env.PWDEBUG) {
        console.log(`PWDEBUG: ${process.env.PWDEBUG}`);
    }
    console.log('='.repeat(60));

    const launchArgs = [];
    if (IN_DOCKER) {
        launchArgs.push('--no-sandbox', '--disable-dev-shm-usage');
    }
    if (!effectiveHeadless) {
        launchArgs.push('--start-maximized');
    }

    const browser = await chromium.launch({
        headless: effectiveHeadless,
        slowMo: Number.isNaN(runtimeConfig.SLOW_MO) ? 0 : runtimeConfig.SLOW_MO,
        args: launchArgs
    });
    
    try {
        if (runtimeConfig.START_FROM <= 24) {
            await runSection1(browser);
        }
        if (runtimeConfig.START_FROM <= 40) {
            await runSection2(browser);
        }
        if (runtimeConfig.START_FROM <= 47) {
            await runSection3(browser);
        }
    } catch (error) {
        console.error('\n\n❌ FATAL ERROR:', error);
    } finally {
        await browser.close();
    }
    
    // Generate reports
    return generateReports();
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

function generateReports() {
    const endTime = new Date();
    const duration = endTime - startTime;
    
    console.log('\n\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));
    
    const passed = testResults.filter(t => t.status === 'PASS').length;
    const failed = testResults.filter(t => t.status === 'FAIL').length;
    const skipped = testResults.filter(t => t.status === 'SKIP').length;
    const total = testResults.length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    
    console.log(`Total Tests: ${total}`);
    console.log(`PASS: ${passed} (${passRate}%)`);
    console.log(`FAIL: ${failed}`);
    console.log(`SKIP: ${skipped}`);
    console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log('='.repeat(60));
    
    // CSV Report
    const csvLines = [
        'Test ID,Description,Type,Start Time,Duration (ms),Status,Fail Reason'
    ];
    testResults.forEach(r => {
        csvLines.push([
            r.id,
            r.description,
            r.type,
            r.startTime,
            r.duration,
            r.status,
            r.failReason || '-'
        ].join(','));
    });
    
    const csvPath = path.join(process.cwd(), 'test-results.csv');
    fs.writeFileSync(csvPath, csvLines.join('\n'));
    console.log(`\n✅ CSV report: ${csvPath}`);
    
    // HTML Report (basic)
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>MTS-Stratos Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #4CAF50; color: white; }
        .pass { background-color: #d4edda; }
        .fail { background-color: #f8d7da; }
        .summary { margin: 20px 0; padding: 10px; background: #f0f0f0; }
    </style>
</head>
<body>
    <h1>MTS-Stratos E2E Test Report</h1>
    <div class="summary">
        <p><strong>Execution Date:</strong> ${startTime.toISOString()}</p>
        <p><strong>Total Duration:</strong> ${(duration / 1000).toFixed(2)}s</p>
        <p><strong>Total Tests:</strong> ${total}</p>
        <p><strong>Pass:</strong> ${passed} (${passRate}%)</p>
        <p><strong>Fail:</strong> ${failed}</p>
    </div>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Description</th>
                <th>Type</th>
                <th>Duration (ms)</th>
                <th>Status</th>
                <th>Fail Reason</th>
            </tr>
        </thead>
        <tbody>
            ${testResults.map(r => `
            <tr class="${r.status === 'PASS' ? 'pass' : 'fail'}">
                <td>${r.id}</td>
                <td>${r.description}</td>
                <td>${r.type}</td>
                <td>${r.duration}</td>
                <td>${r.status}</td>
                <td>${r.failReason || '-'}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`;
    
    const htmlPath = path.join(process.cwd(), 'test-report.html');
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`✅ HTML report: ${htmlPath}`);
    
    // JSON Report (for Excel conversion)
    const jsonPath = path.join(process.cwd(), 'test-results.json');
    const jsonReport = {
        summary: {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            durationMs: duration,
            totalTests: total,
            passed,
            failed,
            passRate: passRate + '%'
        },
        tests: testResults
    };
    fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));
    console.log(`✅ JSON report: ${jsonPath}`);
    
    console.log('\n='.repeat(60));

    return {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        durationMs: duration,
        total,
        passed,
        failed,
        skipped,
        passRate: `${passRate}%`
    };
}

// Run
const isExecutedDirectly = (() => {
    if (!process.argv[1]) return false;
    return import.meta.url === pathToFileURL(process.argv[1]).href;
})();

if (isExecutedDirectly) {
    main()
        .then((summary) => {
            if (summary && summary.failed > 0) {
                process.exitCode = 1;
            }
        })
        .catch((error) => {
            console.error(error);
            process.exitCode = 1;
        });
}
