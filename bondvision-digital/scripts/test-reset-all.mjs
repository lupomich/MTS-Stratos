import axios from 'axios'
import { chromium } from 'playwright'

const API_BASE = process.env.API_BASE || 'http://host.docker.internal:3000/api'
const UI_BASE = process.env.UI_BASE || 'http://localhost:3002'

const testPreferences = {
  theme: 'dark',
  language: 'en',
  gridLayout: 'comfortable',
  defaultColumns: ['description', 'isin', 'price', 'yield', 'maturity'],
  columnOrder: ['isin', 'description', 'ccy'],  // Custom order
  columnWidths: {
    isin: 150,
    description: 400,
    ccy: 80
  },
  filters: {},
  sorts: [{ colId: 'isin', sort: 'asc' }],
  lastTab: 'government-bonds'
}

const loginAndSetPreferences = async () => {
  const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
    username: 'admin',
    password: 'admin123'
  })

  const token = loginResponse.data.token
  await axios.put(`${API_BASE}/preferences/ui_settings`, testPreferences, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  console.log('✓ Preferences set to custom order: ISIN, DESCRIPTION, CCY')
}

const getHeaderOrder = async (page) => {
  return await page.evaluate(() => {
    const headerCells = document.querySelectorAll('.ag-header-cell')
    const firstTableHeaders = Array.from(headerCells).slice(0, 20)
    return firstTableHeaders.map(cell => {
      const textEl = cell.querySelector('.ag-header-cell-text')
      return textEl ? textEl.textContent?.trim() : ''
    }).filter(Boolean)
  })
}

const run = async () => {
  await loginAndSetPreferences()

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  page.on('request', req => console.log('Request:', req.method(), req.url()))
  page.on('response', res => console.log('Response:', res.status(), res.url()))

  await page.goto(UI_BASE, { waitUntil: 'domcontentloaded' })

  // Login
  await page.fill('#username', 'admin')
  await page.fill('#password', 'admin123')
  await page.click('button.submit-btn')
  await page.waitForSelector('.ag-header-cell-text', { timeout: 10000 })

  // Step 1: Verify custom order is applied
  console.log('\n=== Step 1: Check Initial Custom Order ===')
  let headers = await getHeaderOrder(page)
  console.log('Headers after login:', headers.slice(0, 10).join(' | '))
  
  const descriptionIndexBefore = headers.indexOf('DESCRIPTION')
  const isinIndexBefore = headers.indexOf('ISIN')
  const ccyIndexBefore = headers.indexOf('CCY')
  
  console.log(`DESCRIPTION index: ${descriptionIndexBefore}`)
  console.log(`ISIN index: ${isinIndexBefore}`)
  console.log(`CCY index: ${ccyIndexBefore}`)
  
  if (isinIndexBefore < descriptionIndexBefore && descriptionIndexBefore < ccyIndexBefore) {
    console.log('✓ Custom order is applied (ISIN -> DESCRIPTION -> CCY)')
  } else {
    console.log('✗ Custom order NOT applied correctly')
  }

  // Step 2: Click on a column header menu and click "Reset All"
  console.log('\n=== Step 2: Click Reset All ===')
  const firstHeaderMenu = await page.$(':nth-child(1) .header-menu-icon')
  
  if (firstHeaderMenu) {
    await firstHeaderMenu.click()
    console.log('✓ Clicked column header menu')
    
    // Wait for menu to appear and look for resetAll option
    await page.waitForSelector('[data-action="resetAll"]', { timeout: 5000 })
    
    const resetAllButton = await page.$('[data-action="resetAll"]')
    if (resetAllButton) {
      await resetAllButton.click()
      console.log('✓ Clicked Reset All button')
      
      // Wait for DOM to update
      await page.waitForTimeout(500)
    }
  } else {
    console.log('✗ Could not find header menu button')
  }

  // Step 3: Check if columns returned to default
  console.log('\n=== Step 3: Check Default Order After Reset ===')
  headers = await getHeaderOrder(page)
  console.log('Headers after reset:', headers.slice(0, 10).join(' | '))
  
  const descriptionIndexAfter = headers.indexOf('DESCRIPTION')
  const isinIndexAfter = headers.indexOf('ISIN')
  const ccyIndexAfter = headers.indexOf('CCY')
  
  console.log(`DESCRIPTION index: ${descriptionIndexAfter}`)
  console.log(`ISIN index: ${isinIndexAfter}`)
  console.log(`CCY index: ${ccyIndexAfter}`)
  
  // Check if it returned to default (DESCRIPTION should be first)
  if (descriptionIndexAfter < isinIndexAfter) {
    console.log('✓ Order appears to be reset to default (DESCRIPTION first)')
  } else {
    console.log('✗ Order NOT reset - still in custom order or different order')
  }

  // Step 4: Reload page and check if reset persists
  console.log('\n=== Step 4: Reload Page to Check Persistence ===')
  await page.goto(UI_BASE, { waitUntil: 'domcontentloaded' })
  
  // Need to login again since we navigated away
  await page.fill('#username', 'admin')
  await page.fill('#password', 'admin123')
  await page.click('button.submit-btn')
  await page.waitForSelector('.ag-header-cell-text', { timeout: 10000 })
  
  await page.waitForTimeout(1000)
  
  headers = await getHeaderOrder(page)
  console.log('Headers after page reload:', headers.slice(0, 10).join(' | '))
  
  const descriptionIndexReload = headers.indexOf('DESCRIPTION')
  const isinIndexReload = headers.indexOf('ISIN')
  
  if (descriptionIndexReload < isinIndexReload) {
    console.log('✓ After reload: Still in default order (DESCRIPTION first)')
    console.log('✓ Reset persisted correctly!')
  } else {
    console.log('✗ After reload: Order reverted back to custom (ISIN first)')
    console.log('✗ Reset did NOT persist - preferences were not actually reset')
  }

  await browser.close()
}

run().catch(async (error) => {
  console.error('Test failed:', error)
  process.exit(1)
})
