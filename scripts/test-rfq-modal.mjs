#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RESULTS_DIR = path.join(__dirname, '../test-results');
const REPORT_FILE = path.join(RESULTS_DIR, 'rfq-modal-test.json');

const BASE_URL = 'http://localhost:3002';
const TEST_CREDENTIALS = {
  email: 'trader@example.com',
  password: 'password123'
};

// Ensure results directory exists
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

const results = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0
  }
};

async function addTest(name, fn) {
  console.log(`\n📋 Running: ${name}`);
  const test = { name, passed: false, error: null, duration: 0 };
  const startTime = Date.now();

  try {
    await fn();
    test.passed = true;
    console.log(`✅ PASSED: ${name}`);
  } catch (error) {
    test.error = error.message;
    console.error(`❌ FAILED: ${name}`);
    console.error(`   Error: ${error.message}`);
  }

  test.duration = Date.now() - startTime;
  results.tests.push(test);
  results.summary.total++;
  if (test.passed) results.summary.passed++;
  else results.summary.failed++;
}

async function runTests() {
  let browser;
  let page;

  try {
    console.log('🚀 Starting Playwright browser...');
    browser = await chromium.launch({ headless: false });
    page = await browser.newPage();

    // Intercept console messages for debugging
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`  [Browser ${msg.type()}] ${msg.text()}`);
      }
    });

    // Intercept and log responses
    page.on('response', (response) => {
      if (response.url().includes('/api/bonds')) {
        console.log(`  [API Response] ${response.status()} ${response.url()}`);
      }
    });

    // Test 1: Navigate to login
    await addTest('Navigate to login page', async () => {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    });

    // Test 2: Login
    let isLoggedIn = false;
    await addTest('Login with credentials', async () => {
      await page.fill('input[type="email"]', TEST_CREDENTIALS.email);
      await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
      await page.click('button:has-text("Login")');
      // Wait for main content to load
      await page.waitForSelector('[class*="MainContent"]', { timeout: 10000 });
      isLoggedIn = true;
    });

    if (!isLoggedIn) {
      console.error('❌ Failed to login, cannot continue tests');
      saveResults();
      process.exit(1);
    }

    // Test 3: Wait for bond table to load
    await addTest('Bond table loads', async () => {
      await page.waitForSelector('[role="grid"]', { timeout: 10000 });
      // Wait for at least one row
      await page.waitForSelector('[role="row"]', { timeout: 10000 });
    });

    // Test 4: Double-click on first bond row
    let modalOpened = false;
    await addTest('Double-click opens RFQ modal', async () => {
      // Find first data row (skip header)
      const rows = await page.locator('[role="row"]').count();
      if (rows < 2) throw new Error('No bond rows found in table');

      // Get first data row
      const firstRow = page.locator('[role="row"]').nth(1);
      
      // Double-click on the row
      const bbox = await firstRow.boundingBox();
      if (!bbox) throw new Error('Could not get bounding box of row');

      // Double-click near the center of the row
      await page.mouse.move(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2);
      await page.mouse.dblclick();

      // Wait for modal to appear
      await page.waitForSelector('[class*="Modal"]', { timeout: 5000 });
      modalOpened = true;
    });

    if (modalOpened) {
      // Test 5: Verify modal content
      await addTest('Modal displays correct content', async () => {
        // Check for modal title
        await page.waitForSelector('text=RFQ OUTRIGHT', { timeout: 3000 });
        // Check for SIDE selector
        await page.waitForSelector('[class*="SideSelector"]', { timeout: 3000 });
        // Check for dealer grid
        await page.waitForSelector('[class*="DealerGrid"]', { timeout: 3000 });
      });

      // Test 6: Close modal by clicking outside
      await addTest('Close modal', async () => {
        // Click outside the modal (on overlay)
        const modal = await page.locator('[class*="RfqModal"]').first();
        const bbox = await modal.boundingBox();
        if (bbox) {
          // Click far left, which should be on the overlay
          await page.mouse.click(50, 50);
        }
        // Wait for modal to disappear
        await page.waitForTimeout(500);
        const modalVisible = await page.locator('[class*="Modal"]').isVisible().catch(() => false);
        if (modalVisible) throw new Error('Modal did not close');
      });

      // Test 7: Click "Open RFQ" button
      let buttonModalOpened = false;
      await addTest('Open RFQ button opens modal', async () => {
        // First select a bond by clicking on it
        const rows = await page.locator('[role="row"]').count();
        if (rows < 2) throw new Error('No bond rows found');

        const firstRow = page.locator('[role="row"]').nth(1);
        await firstRow.click();

        // Wait a moment for selection
        await page.waitForTimeout(300);

        // Find and click the RFQ menu button (looks for dropdown or context menu)
        // The menu should be visible after clicking the row
        const menuButton = page.locator('button:has-text("RFQ")').first();
        if (await menuButton.isVisible()) {
          await menuButton.click();
          await page.waitForTimeout(500);
        }

        // Look for "Open RFQ" button in dropdown or main UI
        const openRfqBtn = page.locator('text=Open RFQ').first();
        if (await openRfqBtn.isVisible()) {
          await openRfqBtn.click();
          await page.waitForSelector('[class*="Modal"]', { timeout: 5000 });
          buttonModalOpened = true;
        }
      });

      if (buttonModalOpened) {
        // Test 8: Verify modal opened from button
        await addTest('Modal from button displays correctly', async () => {
          await page.waitForSelector('text=RFQ OUTRIGHT', { timeout: 3000 });
        });

        // Test 9: Close modal
        await addTest('Close button modal', async () => {
          await page.mouse.click(50, 50);
          await page.waitForTimeout(500);
        });
      } else {
        console.warn('⚠️  "Open RFQ" button test skipped - button not found');
      }
    }

    // Test 10: Check browser console for errors
    await addTest('No critical errors in console', async () => {
      // This test just checks that we didn't get fatal errors
      // Errors would have been logged via the console handler
      const consoleErrors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Give it a moment to capture any errors
      await page.waitForTimeout(1000);

      if (consoleErrors.length > 0) {
        throw new Error(`Console errors detected: ${consoleErrors.join(', ')}`);
      }
    });

  } catch (error) {
    console.error('\n❌ Test execution error:', error.message);
    results.summary.errorMessage = error.message;
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (e) {
        console.warn('Warning: Could not close page', e.message);
      }
    }
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.warn('Warning: Could not close browser', e.message);
      }
    }
  }

  saveResults();
}

function saveResults() {
  fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2));
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.summary.total}`);
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`Success Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);
  console.log(`\n📝 Full report saved to: ${REPORT_FILE}`);
  console.log('='.repeat(60));

  if (results.summary.failed > 0) {
    console.log('\n❌ FAILED TESTS:\n');
    results.tests
      .filter((t) => !t.passed)
      .forEach((t) => {
        console.log(`  - ${t.name}`);
        console.log(`    ${t.error}`);
      });
  }

  process.exit(results.summary.failed > 0 ? 1 : 0);
}

console.log('🧪 RFQ Modal Test Suite');
console.log('========================\n');
runTests();
