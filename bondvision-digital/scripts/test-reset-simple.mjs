import axios from 'axios'
import { chromium } from 'playwright'

const API_BASE = process.env.API_BASE || 'http://host.docker.internal:3000/api'
const UI_BASE = process.env.UI_BASE || 'http://localhost:3002'

const testPreferences = {
  theme: 'dark',
  language: 'en',
  gridLayout: 'comfortable',
  columnOrder: ['isin', 'description', 'ccy'],
  sorts: [{ colId: 'isin', sort: 'asc' }],
  lastTab: 'government-bonds'
}

const loginAndSetPreferences = async () => {
  try {
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    })

    const token = loginResponse.data.token
    await axios.put(`${API_BASE}/preferences/ui_settings`, testPreferences, {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log('✓ Step 0: Preferences set to custom order: ISIN, DESCRIPTION, CCY')
  } catch (err) {
    console.error('✗ Step 0 FAILED: Could not set preferences')
    console.error(err.message)
    throw err
  }
}

const getHeaderOrder = async (page) => {
  return await page.evaluate(() => {
    const headerCells = document.querySelectorAll('.custom-header-wrapper')
    return Array.from(headerCells).map(cell => {
      const textEl = cell.querySelector('.header-text')
      return textEl ? textEl.textContent?.trim() : ''
    }).filter(Boolean)
  })
}

const testDirectAPIReset = async () => {
  console.log('\n=== DIRECT API RESET TEST ===')
  try {
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    })
    const token = loginResponse.data.token

    // First set custom preferences
    console.log('Setting custom preferences...')
    await axios.put(`${API_BASE}/preferences/ui_settings`, {
      theme: 'dark',
      language: 'en',
      columnOrder: ['isin', 'description', 'ccy']
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log('✓ Custom preferences set via API')

    // Now reset via API
    console.log('Resetting preferences via API...')
    await axios.put(`${API_BASE}/preferences/ui_settings`, {
      theme: 'dark',
      language: 'en',
      columnOrder: []  // Empty to reset
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log('✓ Reset API call made')

    // Verify
    const response = await axios.get(`${API_BASE}/preferences/ui_settings`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log('✓ Current preferences:', response.data)
  } catch (err) {
    console.error('✗ API test failed:', err.message)
  }
}

const run = async () => {
  console.log('=== RESET ALL TEST ===')
  console.log(`API Base: ${API_BASE}`)
  console.log(`UI Base: ${UI_BASE}`)
  
  await loginAndSetPreferences()

  const browser = await chromium.launch({ headless: true })
  const context = await browser.createBrowserContext()
  const page = await context.newPage()

  // Log all console messages and errors
  const consoleLogs = []
  page.on('console', msg => {
    const logEntry = `[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`
    consoleLogs.push(logEntry)
    console.log(logEntry)
  })
  page.on('pageerror', error => {
    const errEntry = `[BROWSER ERROR] ${error.message}`
    consoleLogs.push(errEntry)
    console.log(errEntry)
  })

  try {
    console.log('✓ Step 1a: Opening UI...')
    await page.goto(UI_BASE, { waitUntil: 'domcontentloaded', timeout: 10000 })
    console.log('✓ Step 1b: Page loaded')

    console.log('✓ Step 1c: Filling login form...')
    await page.fill('#username', 'admin')
    await page.fill('#password', 'admin123')
    
    console.log('✓ Step 1d: Clicking submit...')
    await page.click('button.submit-btn')
    
    console.log('✓ Step 1e: Waiting for grid to load...')
    await page.waitForSelector('.custom-header-wrapper', { timeout: 15000 })
    await page.waitForTimeout(1000)
    console.log('✓ Step 1: Login successful, grid loaded')

    // Verify custom order
    console.log('\n=== Step 2: Verify Custom Order Applied ===')
    let headers = await getHeaderOrder(page)
    console.log(`Headers found: ${headers.join(' → ')}`)
    const isinBefore = headers.indexOf('ISIN')
    const descBefore = headers.indexOf('DESCRIPTION')
    console.log(`ISIN at index: ${isinBefore}, DESCRIPTION at index: ${descBefore}`)
    
    if (descBefore > isinBefore) {
      console.log('✓ Custom order confirmed (ISIN before DESCRIPTION)')
    } else {
      console.log('⚠ Order might already be default')
    }

    // Click Reset All
    console.log('\n=== Step 3: Finding and Clicking Reset All ===')
    const menuIcons = await page.$$('.header-menu-icon')
    console.log(`Found ${menuIcons.length} header menu icons`)
    
    if (menuIcons.length === 0) {
      console.log('✗ No menu icons found!')
      console.log('Browser console logs collected:')
      consoleLogs.forEach(log => console.log('  ' + log))
      await browser.close()
      process.exit(1)
    }
    
    let resetClicked = false
    for (let i = 0; i < Math.min(2, menuIcons.length); i++) {
      console.log(`Trying menu icon ${i+1}/${menuIcons.length}...`)
      try {
        await menuIcons[i].click({ timeout: 3000 })
        console.log(`✓ Clicked menu icon ${i+1}`)
        await page.waitForTimeout(500)
        
        // Look for reset button
        const resetBtn = await page.$('[data-action="resetAll"]')
        if (resetBtn) {
          console.log('✓ Found Reset All button')
          // Get browser logs before reset
          console.log('Browser logs BEFORE reset:')
          consoleLogs.slice(-5).forEach(log => console.log('  ' + log))
          
          await resetBtn.click()
          console.log('✓ Clicked Reset All')
          
          // Wait and capture logs after reset
          await page.waitForTimeout(1000)
          console.log('Browser logs AFTER reset:')
          consoleLogs.slice(-10).forEach(log => console.log('  ' + log))
          
          resetClicked = true
          break
        } else {
          console.log('⚠ Reset All button not found after clicking menu')
          // Close menu by clicking elsewhere
          await page.click('.ag-header-row')
          await page.waitForTimeout(300)
        }
      } catch (e) {
        console.log(`⚠ Error with menu icon ${i+1}: ${e.message}`)
      }
    }
    
    if (!resetClicked) {
      console.log('✗ Could not click Reset All button')
    } else {
      console.log('✓ Step 3: Reset All clicked')
    }

    // Check result
    console.log('\n=== Step 4: Check Result ===')
    await page.waitForTimeout(500)
    headers = await getHeaderOrder(page)
    console.log(`Headers after reset: ${headers.join(' → ')}`)
    const isinAfter = headers.indexOf('ISIN')
    const descAfter = headers.indexOf('DESCRIPTION')
    console.log(`ISIN at index: ${isinAfter}, DESCRIPTION at index: ${descAfter}`)

    if (descAfter < isinAfter) {
      console.log('✅ SUCCESS: Returned to default (DESCRIPTION first)')
    } else if (isinAfter !== -1 && descAfter !== -1) {
      console.log('❌ FAIL: Still in custom order')
    } else {
      console.log('⚠ Could not determine order (column not found)')
    }
    
    // Print all logs at the end
    console.log('\n=== ALL BROWSER CONSOLE LOGS ===')
    consoleLogs.forEach(log => console.log(log))

  } catch (error) {
    console.error('✗ Test failed with error:', error.message)
    console.log('\n=== CONSOLE LOGS COLLECTED SO FAR ===')
    consoleLogs.forEach(log => console.log(log))
  } finally {
    await browser.close()
  }
}

run().catch(err => {
  console.error('Fatal error:', err.message)
  process.exit(1)
})

// Uncomment to test direct API reset without UI
// testDirectAPIReset().then(() => process.exit(0))
