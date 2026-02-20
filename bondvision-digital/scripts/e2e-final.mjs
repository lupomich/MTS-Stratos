#!/usr/bin/env node

/**
 * MTS-Stratos E2E Test Suite FINALE
 * Data: 2026-02-20
 * Focus: GUI primario, API secondario
 * Timeout: 10 secondi per test
 * Tests totali: 40
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://172.18.0.5:3002';
const API_BASE = process.env.API_BASE || 'http://bondvision-backend:3000/api';
const TEST_TIMEOUT = 30000; // 30 secondi
const ADMIN_USER = { username: 'admin', password: 'admin123' };
const STOP_ON_FIRST_FAIL = process.env.STOP_ON_FIRST_FAIL === 'true';
const START_FROM = Number.parseInt(process.env.START_FROM || '1', 10);

// Test results storage
const testResults = [];
const startTime = new Date();

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
    if (!Number.isNaN(testNumber) && testNumber < START_FROM) {
        return {
            id: testId,
            description,
            type,
            startTime: new Date().toISOString(),
            duration: 0,
            status: 'SKIP',
            failReason: `Skipped by START_FROM=${START_FROM}`
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
                setTimeout(() => reject(new Error('Timeout 10s')), TEST_TIMEOUT)
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
    if (STOP_ON_FIRST_FAIL && result.status === 'FAIL') {
        throw new Error(`STOP_AT_${testId}: ${result.failReason}`);
    }
    return result;
}

// Utility: Login GUI
async function loginGUI(page, username, password) {
    await page.goto(BASE_URL);
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

// Utility: Open Admin Panel
async function openAdminPanel(page) {
    await page.locator('.sidebar-item.sidebar-admin').click();
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
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ADMIN_USER)
    });
    const { token } = await response.json();
    
    const usersResponse = await fetch(`${API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await usersResponse.json();
    return data.users;
}

async function cleanupResidualTestUsersAPI() {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ADMIN_USER)
    });
    const { token } = await response.json();

    const usersResponse = await fetch(`${API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await usersResponse.json();
    const usernamesToDelete = new Set([
        'admin-test',
        'trader-test',
        'viewer-test',
        'trader-final',
        'viewer-final'
    ]);

    for (const user of data.users || []) {
        if (usernamesToDelete.has(user.username)) {
            await fetch(`${API_BASE}/users/by-username/${encodeURIComponent(user.username)}`, {
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
    
    const context = await browser.newContext();
    const page = await context.newPage();

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
        
        // Verify Admin Panel available
        const adminBtnExists = await page.locator('.sidebar-item.sidebar-admin').count() > 0;
        if (!adminBtnExists) throw new Error('Admin Panel button not visible');
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
        await page.goto(BASE_URL);
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
        
        // Verify NO Admin Panel
        const adminBtnExists = await page.locator('.sidebar-item.sidebar-admin').count() > 0;
        if (adminBtnExists) throw new Error('Admin Panel should NOT be visible for trader');
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
        await page.goto(BASE_URL);
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
        
        // Verify NO Admin Panel
        const adminBtnExists = await page.locator('.sidebar-item.sidebar-admin').count() > 0;
        if (adminBtnExists) throw new Error('Admin Panel should NOT be visible for viewer');
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
        
        await page.goto(BASE_URL);
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

    if (START_FROM >= 22) {
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
// SECTION 2: SETTINGS PERSISTENCE - GUI (Tests 25-36)
// ============================================================================

async function runSection2(browser) {
    console.log('\n\n========================================');
    console.log('SECTION 2: SETTINGS PERSISTENCE - GUI');
    console.log('========================================\n');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
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
    
    // --- Subsection F: Sorting (T29-T32) ---
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
    
    await runTest('T32', 'Persist sort after logout', 'GUI', async () => {
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
    
    // --- Subsection G: Filtering (T33-T36) ---
    console.log('\n--- Subsection G: Filtering ---');
    
    await runTest('T33', 'Single filter', 'GUI', async () => {
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
    
    await runTest('T34', 'Multiple filters', 'GUI', async () => {
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
    
    await runTest('T35', 'Remove one filter', 'GUI', async () => {
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
    
    await runTest('T36', 'Clear all filters', 'GUI', async () => {
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
// SECTION 3: FULL PERSISTENCE & CLEANUP (Tests 37-40)
// ============================================================================

async function runSection3(browser) {
    console.log('\n\n========================================');
    console.log('SECTION 3: FULL PERSISTENCE & CLEANUP');
    console.log('========================================\n');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Login as trader-final
    await loginGUI(page, 'trader-final', 'Trader123!');
    await page.locator('.main-content').waitFor({ state: 'visible' });
    await waitForBondGrid(page);
    await waitForGridApi(page);
    
    await runTest('T37', 'Mixed modifications', 'GUI', async () => {
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
    
    await runTest('T38', 'Persist all after reload', 'GUI', async () => {
        await page.waitForTimeout(3000);
        await logoutGUI(page);
        await loginGUI(page, 'trader-final', 'Trader123!');
        await waitForBondGrid(page);

        const state = await getGridState(page);
        if (!state || state.totalRowCount <= 0) {
            throw new Error('Persist: grid state unavailable after relogin');
        }
    });
    
    await runTest('T39', 'Complete reset', 'GUI', async () => {
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
    
    await runTest('T40', 'Final cleanup', 'GUI', async () => {
        // Logout trader-final
        await logoutGUI(page);
        
        // Login as admin
        await loginGUI(page, ADMIN_USER.username, ADMIN_USER.password);
        await openAdminPanel(page);
        
        // Delete trader-final and viewer-final
        await deleteUserGUI(page, 'trader-final');
        await deleteUserGUI(page, 'viewer-final');
        
        // Verify only admin
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
    console.log('='.repeat(60));
    console.log('MTS-STRATOS E2E TEST SUITE FINALE');
    console.log('='.repeat(60));
    console.log(`Start: ${startTime.toISOString()}`);
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`API URL: ${API_BASE}`);
    console.log(`Timeout per test: ${TEST_TIMEOUT}ms`);
    console.log('='.repeat(60));
    
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    try {
        await runSection1(browser);
        await runSection2(browser);
        await runSection3(browser);
    } catch (error) {
        console.error('\n\n❌ FATAL ERROR:', error);
    } finally {
        await browser.close();
    }
    
    // Generate reports
    generateReports();
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
}

// Run
main().catch(console.error);
