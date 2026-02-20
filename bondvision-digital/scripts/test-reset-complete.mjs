#!/usr/bin/env node

import { chromium } from 'playwright'
import axios from 'axios'

const API_URL = 'http://localhost:3000'
const APP_URL = 'http://localhost:3002'

async function loginAndSetPreferences() {
  const response = await axios.post(`${API_URL}/api/auth/login`, {
    username: 'admin',
    password: 'admin123'
  })
  const token = response.data.token

  // Set custom column order via API
  await axios.put(
    `${API_URL}/api/preferences/ui_settings`,
    {
      columnOrder: ['isin', 'description', 'ccy'],
      theme: 'dark',
      language: 'en'
    },
    { headers: { Authorization: `Bearer ${token}` } }
  )

  return token
}

async function runTest() {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  })
  const page = await context.newPage()

  // Capture console logs
  const consoleLogs = []
  page.on('console', msg => {
    consoleLogs.push(`[BROWSER] ${msg.type().toUpperCase()}: ${msg.text()}`)
  })

  try {
    console.log('=== COMPREHENSIVE RESET TEST ===\n')

    // Step 1: Set up preferences via API
    console.log('Step 1: Setting custom preferences via API')
    await loginAndSetPreferences()
    console.log('✓ Custom column order set: ISIN, DESCRIPTION, CCY\n')

    // Step 2: Load page and verify custom order
    console.log('Step 2: Load page and verify custom column order applied')
    await page.goto(`${APP_URL}`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000) // Wait for preferences to apply

    // Get header order
    const headersBefore = await page.$$eval('.ag-header-cell', els =>
      els.map(el => el.textContent.trim()).slice(0, 4)
    )
    console.log(`Headers (before reset): ${headersBefore.join(' → ')}`)

    // Verify custom order was applied
    const headerText = headersBefore[0]
    if (headerText === 'ISIN') {
      console.log('✓ Custom order applied correctly\n')
    } else {
      console.log(
        `✗ Custom order NOT applied (first header is ${headerText}, expected ISIN)\n`
      )
    }

    // Step 3: Click Reset All button
    console.log('Step 3: Click Reset All button')
    await page.click('button[id="reset-all-btn"]')
    console.log('✓ Reset All clicked')
    await page.waitForTimeout(1500) // Wait for reset to complete

    // Get new header order
    const headersAfter = await page.$$eval('.ag-header-cell', els =>
      els.map(el => el.textContent.trim()).slice(0, 4)
    )
    console.log(`Headers (after reset): ${headersAfter.join(' → ')}\n`)

    // Verify reset worked
    if (headersAfter[0] === 'DESCRIPTION') {
      console.log('✓ Reset to default order successful\n')
    } else {
      console.log(
        `✗ Reset to default order FAILED (first header is ${headersAfter[0]}, expected DESCRIPTION)\n`
      )
    }

    // Step 4: Reload page and verify reset persisted
    console.log('Step 4: Reload page and verify reset persisted')
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForTimeout(2000) // Wait for preferences to load

    const headersAfterReload = await page.$$eval('.ag-header-cell', els =>
      els.map(el => el.textContent.trim()).slice(0, 4)
    )
    console.log(`Headers (after reload): ${headersAfterReload.join(' → ')}\n`)

    // Verify persistence
    if (JSON.stringify(headersAfter) === JSON.stringify(headersAfterReload)) {
      console.log('✅ ALL TESTS PASSED: Reset is persistent\n')
    } else {
      console.log(
        '✗ Reset did NOT persist after reload\n'
      )
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\nBrowser logs:')
    consoleLogs.forEach(log => console.log(log))
  }

  await browser.close()
}

runTest()
