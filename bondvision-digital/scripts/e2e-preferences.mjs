import axios from 'axios'
import { chromium } from 'playwright'

const API_BASE = process.env.API_BASE || 'http://host.docker.internal:3000/api'
const UI_BASE = process.env.UI_BASE || 'http://localhost:3002'

const testPreferences = {
  theme: 'dark',
  language: 'en',
  gridLayout: 'comfortable',
  defaultColumns: ['description', 'isin', 'price', 'yield', 'maturity'],
  columnOrder: ['isin', 'description', 'ccy'],
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
}

const run = async () => {
  await loginAndSetPreferences()

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  page.on('request', req => {
    console.log('Request:', req.method(), req.url())
  })
  page.on('response', res => {
    console.log('Response:', res.status(), res.url())
  })

  let response;
  try {
    response = await page.goto(UI_BASE, { waitUntil: 'domcontentloaded' })
    if (response) {
      console.log('HTTP status:', response.status())
    } else {
      console.log('HTTP status: null (no response)')
    }
  } catch (err) {
    console.log('page.goto error:', err)
  }
  const html = await page.content()
  console.log('Loaded HTML:', html)
  await page.fill('#username', 'admin')
  await page.fill('#password', 'admin123')
  await page.click('button.submit-btn')

  await page.waitForSelector('.ag-header-cell-text', { timeout: 10000  })

  // Get headers from the BondTable specifically
  const headers = await page.evaluate(() => {
    const headerCells = document.querySelectorAll('.ag-header-cell')
    const firstTableHeaders = Array.from(headerCells).slice(0, 20) // BondTable headers
    return firstTableHeaders.map(cell => {
      const textEl = cell.querySelector('.ag-header-cell-text')
      return textEl ? textEl.textContent?.trim() : ''
    }).filter(Boolean)
  })

  const isinIndex = headers.indexOf('ISIN')
  const descriptionIndex = headers.indexOf('DESCRIPTION')
  const ccyIndex = headers.indexOf('CCY')

  const orderOk =
    isinIndex !== -1 &&
    descriptionIndex !== -1 &&
    ccyIndex !== -1 &&
    isinIndex < descriptionIndex &&
    descriptionIndex < ccyIndex

  const sortIcon = await page.$('[col-id="isin"] .header-sort-icon')
  const sortOk = Boolean(sortIcon)

  console.log('Headers:', headers.join(' | '))
  console.log('Order OK:', orderOk)
  console.log('Sort Icon OK:', sortOk)

  await browser.close()

  if (!orderOk || !sortOk) {
    process.exit(1)
  }
}

run().catch(async (error) => {
  console.error('E2E test failed:', error)
  if (error.page) {
    const html = await error.page.content()
    console.error('Page HTML:', html)
  }
  process.exit(1)
})
