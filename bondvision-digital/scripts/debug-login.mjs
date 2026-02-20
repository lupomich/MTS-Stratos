#!/usr/bin/env node

import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://bondvision-digital:3002';

(async () => {
    console.log('🔍 DEBUG LOGIN TEST');
    console.log(`Base URL: ${BASE_URL}`);
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture console messages
    page.on('console', msg => {
        console.log(`[BROWSER ${msg.type()}]`, msg.text());
    });
    
    // Capture network failures
    page.on('requestfailed', request => {
        console.log(`❌ REQUEST FAILED: ${request.url()} - ${request.failure().errorText}`);
    });
    
    // Capture responses
    page.on('response', response => {
        if (response.url().includes('/api/')) {
            console.log(`📡 API Response: ${response.status()} ${response.url()}`);
        }
    });
    
    try {
        console.log('\n1️⃣ Going to login page...');
        await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 10000 });
        await page.screenshot({ path: '/app/debug-01-homepage.png' });
        console.log('✅ Page loaded');
        
        console.log('\n2️⃣ Filling login form...');
        await page.locator('#username').fill('admin');
        await page.locator('#password').fill('admin123');
        await page.screenshot({ path: '/app/debug-02-filled.png' });
        console.log('✅ Form filled');
        
        console.log('\n3️⃣ Clicking submit...');
        await page.locator('button[type="submit"]').click();
        console.log('✅ Button clicked');
        
        console.log('\n4️⃣ Waiting for navigation or error...');
        await page.waitForTimeout(3000);
        await page.screenshot({ path: '/app/debug-03-afterclick.png' });
        
        const currentURL = page.url();
        console.log(`Current URL: ${currentURL}`);
        
        const mainContentVisible = await page.locator('.main-content').isVisible().catch(() => false);
        console.log(`Main content visible: ${mainContentVisible}`);
        
        const errorVisible = await page.locator('.error, .alert-error, [class*="error"]').count();
        console.log(`Error elements found: ${errorVisible}`);
        
        if (errorVisible > 0) {
            const errorText = await page.locator('.error, .alert-error, [class*="error"]').first().textContent();
            console.log(`Error message: ${errorText}`);
        }
        
        // Check local storage
        const localStorage = await page.evaluate(() => JSON.stringify(window.localStorage));
        console.log(`LocalStorage: ${localStorage}`);
        
        console.log('\n✅ DEBUG COMPLETE - Check /app/debug-*.png for screenshots');
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        await page.screenshot({ path: '/app/debug-error.png' });
    } finally {
        await browser.close();
    }
})();
