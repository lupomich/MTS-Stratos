import axios from 'axios'
import { chromium } from 'playwright'

const API_BASE = process.env.API_BASE || 'http://host.docker.internal:3000/api'
const UI_BASE = process.env.UI_BASE || 'http://localhost:3002'

const loginAndSetPreferences = async () => {
  const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
    username: 'admin',
    password: 'admin123'
  })

  const token = loginResponse.data.token
  await axios.put(`${API_BASE}/preferences/ui_settings`, {
    theme: 'dark',
    language: 'en',
    columnOrder: ['isin', 'description', 'ccy'],
  }, {
    headers: { Authorization: `Bearer ${token}` }
  })
  console.log('✓ Preferences set to custom order: ISIN, DESCRIPTION, CCY')
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

const run = async () => {
  console.log('=== RESET ALL MINIMAL TEST ===')
  
  await loginAndSetPreferences()

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  // Capture all console logs before they're lost to reload
  const consoleLogs = []
  page.on('console', msg => {
    const text = msg.text()
    consoleLogs.push(text)
    if (text.includes('ResetAll') || text.includes('Calling') || text.includes('Context')) {
      console.log(`[LOG] ${text}`)
    }
  })

  try {
    console.log('\nStep 1: Login and load page')
    await page.goto(UI_BASE, { waitUntil: 'domcontentloaded', timeout: 10000 })
    await page.fill('#username', 'admin')
    await page.fill('#password', 'admin123')
    await page.click('button.submit-btn')
    await page.waitForSelector('.custom-header-wrapper', { timeout: 15000 })
    await page.waitForTimeout(1000)
    console.log('✓ Logged in')

    // Verify custom order
    const headersBefore = await getHeaderOrder(page)
    console.log(`Headers: ${headersBefore.slice(0, 3).join(' → ')}`)
    const isinIdx = headersBefore.indexOf('ISIN')
    const descIdx = headersBefore.indexOf('DESCRIPTION')
    console.log(`BEFORE: ISIN[${isinIdx}], DESC[${descIdx}]`)

    // Click Reset All
    console.log('\nStep 2: Click Reset All button')
    const menu = await page.$('.header-menu-icon')
    if (menu) {
      await menu.click()
      await page.waitForTimeout(300)
      const resetBtn = await page.$('[data-action="resetAll"]')
      if (resetBtn) {
        console.log('✓ Clicking Reset All...')
        await resetBtn.click()
        await page.waitForTimeout(800)
      } else {
        console.log('✗ Reset All button not found')
      }
    }

    // Check result
    const headersAfter = await getHeaderOrder(page)
    console.log(`\nStep 3: Check result`)
    console.log(`Headers: ${headersAfter.slice(0, 3).join(' → ')}`)
    const isinAfter = headersAfter.indexOf('ISIN')
    const descAfter = headersAfter.indexOf('DESCRIPTION')
    console.log(`AFTER: ISIN[${isinAfter}], DESC[${descAfter}]`)

    if (descAfter < isinAfter) {
      console.log('\n✅ SUCCESS: Reset worked (DESCRIPTION first)')
    } else {
      console.log('\n❌ FAIL: Reset did not work')
    }

    // Print all captured logs
    console.log('\n=== ALL CONSOLE LOGS ===')
    consoleLogs.forEach(log => console.log(`[BROWSER] ${log}`))

  } catch (error) {
    console.error('✗ Error:', error.message)
    console.log('\n=== CONSOLE LOGS CAPTURED ===')
    consoleLogs.forEach(log => console.log(`[BROWSER] ${log}`))
  } finally {
    await browser.close()
  }
}

run().catch(err => {
  console.error('Fatal error:', err.message)
  process.exit(1)
})
