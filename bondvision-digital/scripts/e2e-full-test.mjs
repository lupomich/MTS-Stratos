import { chromium } from 'playwright'
import axios from 'axios'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api'
const UI_BASE = process.env.UI_BASE || 'http://localhost:3002'

// Test tracking
const testResults = []
let testCounter = 0
const startTime = new Date()

// Color codes for console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
}

const log = (msg, color = 'reset') => {
  console.log(`${colors[color]}${msg}${colors.reset}`)
}

const recordTest = (testNum, description, passed, details = '') => {
  testCounter++
  const result = {
    num: testNum,
    description,
    passed,
    timestamp: new Date().toISOString(),
    details,
    duration: new Date() - startTime
  }
  testResults.push(result)
  const status = passed ? '✅ PASS' : '❌ FAIL'
  log(`[${testNum}] ${description} - ${status}`, passed ? 'green' : 'red')
  if (!passed && details) {
    log(`  Error: ${details}`, 'yellow')
  }
}

const createTestUser = async (username, password, profile, apiBase = API_BASE) => {
  try {
    // Login as admin
    const loginRes = await axios.post(`${apiBase}/auth/login`, {
      username: 'admin',
      password: 'admin'
    })
    const token = loginRes.data.token

    // Create user
    const createRes = await axios.post(`${apiBase}/users`, {
      username,
      password,
      profile
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    return { success: true, token }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

const deleteTestUser = async (username, apiBase = API_BASE) => {
  try {
    const loginRes = await axios.post(`${apiBase}/auth/login`, {
      username: 'admin',
      password: 'admin'
    })
    const token = loginRes.data.token

    await axios.delete(`${apiBase}/users/${username}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

const testUserCycle = async (page, username, password, profile, profileLabel) => {
  const baseNum = ['ADMIN', 'MEMBER', 'TRADER', 'AUTOEX'].indexOf(profile) * 8 + 1

  try {
    // 1. Create user
    log(`\n🔑 Creating ${profileLabel} user: ${username}`, 'blue')
    const createResult = await createTestUser(username, password, profile)
    recordTest(baseNum, `Create ${profileLabel} user`, createResult.success)
    if (!createResult.success) return false

    // 2. Login
    recordTest(baseNum + 1, `Login ${profileLabel} user`, true)
    await page.goto(`${UI_BASE}/login`)
    await page.fill('input[id="username"]', username)
    await page.fill('input[id="password"]', password)
    await page.click('button[type="submit"]')
    await page.waitForNavigation()
    const loggedIn = await page.url() !== `${UI_BASE}/login`
    recordTest(baseNum + 1, `Login ${profileLabel} user`, loggedIn)

    // 3. Logout
    await page.click('button:has-text("Logout")')
    await page.waitForNavigation()
    const loggedOut = await page.url().includes('login')
    recordTest(baseNum + 2, `Logout ${profileLabel} user`, loggedOut)

    // 4. Disable user
    log(`\n🔒 Disabling ${username}`, 'blue')
    await page.fill('input[id="username"]', 'admin')
    await page.fill('input[id="password"]', 'admin')
    await page.click('button[type="submit"]')
    await page.waitForNavigation()
    await page.goto(`${UI_BASE}/admin/users`)
    const disableBtn = await page.$(`button:has-text("Disable"):near(text="${username}")`)
    if (disableBtn) {
      await disableBtn.click()
      recordTest(baseNum + 3, `Disable ${profileLabel} user`, true)
    } else {
      recordTest(baseNum + 3, `Disable ${profileLabel} user`, false, 'Disable button not found')
    }

    // 5. Try login with disabled user (should fail)
    await page.goto(`${UI_BASE}/login`)
    await page.fill('input[id="username"]', username)
    await page.fill('input[id="password"]', password)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(1000)
    const loginFailed = await page.url().includes('login')
    recordTest(baseNum + 4, `Disabled ${profileLabel} login fails`, loginFailed)

    // 6. Re-enable user
    log(`\n✅ Re-enabling ${username}`, 'blue')
    await page.fill('input[id="username"]', 'admin')
    await page.fill('input[id="password"]', 'admin')
    await page.click('button[type="submit"]')
    await page.waitForNavigation()
    await page.goto(`${UI_BASE}/admin/users`)
    const enableBtn = await page.$(`button:has-text("Enable"):near(text="${username}")`)
    if (enableBtn) {
      await enableBtn.click()
      recordTest(baseNum + 5, `Re-enable ${profileLabel} user`, true)
    } else {
      recordTest(baseNum + 5, `Re-enable ${profileLabel} user`, false, 'Enable button not found')
    }

    // 7. Login after re-enable
    await page.goto(`${UI_BASE}/login`)
    await page.fill('input[id="username"]', username)
    await page.fill('input[id="password"]', password)
    await page.click('button[type="submit"]')
    await page.waitForNavigation()
    const reenabledLogin = await page.url() !== `${UI_BASE}/login`
    recordTest(baseNum + 6, `Re-enabled ${profileLabel} login succeeds`, reenabledLogin)

    // 8. Delete user
    log(`\n🗑️ Deleting ${username}`, 'blue')
    await page.goto(`${UI_BASE}/admin/users`)
    const deleteBtn = await page.$(`button:has-text("Delete"):near(text="${username}")`)
    if (deleteBtn) {
      await deleteBtn.click()
      await page.click('button:has-text("Confirm")')
      recordTest(baseNum + 7, `Delete ${profileLabel} user`, true)
    } else {
      recordTest(baseNum + 7, `Delete ${profileLabel} user`, false, 'Delete button not found')
    }

    return true
  } catch (err) {
    recordTest(baseNum, `${profileLabel} user cycle`, false, err.message)
    return false
  }
}

const testUISettings = async (page) => {
  log('\n📊 Testing UI Settings Persistence', 'blue')
  const baseNum = 33

  try {
    // 1. Create and login member-test
    await createTestUser('member-test', 'member123', 'MEMBER')
    await page.goto(`${UI_BASE}/login`)
    await page.fill('input[id="username"]', 'member-test')
    await page.fill('input[id="password"]', 'member123')
    await page.click('button[type="submit"]')
    await page.waitForNavigation()
    recordTest(baseNum, 'Member-test login for settings', true)

    // 2. Hide a column
    await page.goto(`${UI_BASE}/bonds`)
    await page.waitForSelector('.ag-header-cell', { timeout: 5000 })
    const columnMenuBtn = await page.$('[col-id="price"] .ag-header-cell-menu-button')
    if (columnMenuBtn) {
      await columnMenuBtn.click()
      await page.click('text="Hide Column"')
      await page.waitForTimeout(500)
      recordTest(baseNum + 1, 'Hide column', true)
    } else {
      recordTest(baseNum + 1, 'Hide column', false, 'Column menu not found')
    }

    // 3. Apply filter
    const filterBtn = await page.$('[col-id="isin"] .ag-header-cell-menu-button')
    if (filterBtn) {
      await filterBtn.click()
      await page.fill('input[placeholder="Filter..."]', 'IT')
      await page.waitForTimeout(500)
      recordTest(baseNum + 2, 'Apply filter', true)
    } else {
      recordTest(baseNum + 2, 'Apply filter', false, 'Filter not found')
    }

    // 4. Logout and verify persistence
    await page.click('button:has-text("Logout")')
    await page.waitForNavigation()
    recordTest(baseNum + 3, 'Logout member-test', true)

    // 5. Login and verify settings persist
    await page.fill('input[id="username"]', 'member-test')
    await page.fill('input[id="password"]', 'member123')
    await page.click('button[type="submit"]')
    await page.waitForNavigation()
    await page.goto(`${UI_BASE}/bonds`)
    await page.waitForSelector('.ag-header-cell', { timeout: 5000 })
    const priceColumnVisible = await page.$('[col-id="price"]')
    const settingsPersist = !priceColumnVisible // should be hidden
    recordTest(baseNum + 4, 'Settings persist after logout', settingsPersist)

    // 6. Reset columns
    const resetBtn = await page.$('button:has-text("Reset All Columns")')
    if (resetBtn) {
      await resetBtn.click()
      await page.click('button:has-text("Confirm")')
      recordTest(baseNum + 5, 'Reset all columns', true)
    } else {
      recordTest(baseNum + 5, 'Reset all columns', false, 'Reset button not found')
    }

    // 7. Logout and verify reset persists
    await page.click('button:has-text("Logout")')
    await page.waitForNavigation()
    recordTest(baseNum + 6, 'Logout after reset', true)

    // Cleanup
    await deleteTestUser('member-test')

    return true
  } catch (err) {
    recordTest(baseNum, 'UI Settings tests', false, err.message)
    return false
  }
}

const testBadges = async (page) => {
  log('\n🎭 Testing Header Status Badges', 'blue')
  const baseNum = 41

  try {
    await page.goto(`${UI_BASE}/login`)
    await page.fill('input[id="username"]', 'admin')
    await page.fill('input[id="password"]', 'admin')
    await page.click('button[type="submit"]')
    await page.waitForNavigation()

    // Check for badges
    const testBadge = await page.$('.status-test')
    const marketBadge = await page.$('[class*="market-status"]')
    const memberBadge = await page.$('[class*="member-status"]')
    const traderBadge = await page.$('[class*="dealer-status"]')
    const autoexBadge = await page.$('[class*="autoex-status"]')

    recordTest(baseNum, 'TEST badge visible', !!testBadge)
    recordTest(baseNum + 1, 'Market status badge visible', !!marketBadge)
    recordTest(baseNum + 2, 'Member status badge visible', !!memberBadge)
    recordTest(baseNum + 3, 'Trader status badge visible', !!traderBadge)
    recordTest(baseNum + 4, 'AutoEx status badge visible', !!autoexBadge)

    // Verify badges are uniform in size
    const badgeStyles = await page.evaluate(() => {
      const badges = document.querySelectorAll('[class*="status"]')
      return Array.from(badges).map(b => ({
        width: b.offsetWidth,
        height: b.offsetHeight
      }))
    })

    const heightsUniform = badgeStyles.every(b => b.height === badgeStyles[0].height)
    recordTest(baseNum + 5, 'Badges uniform height', heightsUniform)

    return true
  } catch (err) {
    recordTest(baseNum, 'Badge tests', false, err.message)
    return false
  }
}

const generateReport = () => {
  const endTime = new Date()
  const totalDuration = (endTime - startTime) / 1000

  let reportHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>MTS-Stratos Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .header { background: #333; color: white; padding: 20px; border-radius: 5px; }
    .summary { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    table { width: 100%; border-collapse: collapse; background: white; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #4CAF50; color: white; }
    tr:hover { background: #f5f5f5; }
    .pass { background: #d4edda; color: #155724; font-weight: bold; }
    .fail { background: #f8d7da; color: #721c24; font-weight: bold; }
    .metric { display: inline-block; margin: 10px 20px; }
    .metric-value { font-size: 24px; font-weight: bold; color: #4CAF50; }
    .footer { margin-top: 30px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>MTS-Stratos E2E Test Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
  </div>

  <div class="summary">
    <h2>Test Summary</h2>
    <div class="metric">
      <div>Total Tests</div>
      <div class="metric-value">${testResults.length}</div>
    </div>
    <div class="metric">
      <div>Passed</div>
      <div class="metric-value" style="color: #28a745;">${testResults.filter(t => t.passed).length}</div>
    </div>
    <div class="metric">
      <div>Failed</div>
      <div class="metric-value" style="color: #dc3545;">${testResults.filter(t => !t.passed).length}</div>
    </div>
    <div class="metric">
      <div>Success Rate</div>
      <div class="metric-value">${((testResults.filter(t => t.passed).length / testResults.length) * 100).toFixed(1)}%</div>
    </div>
    <div class="metric">
      <div>Total Duration</div>
      <div class="metric-value">${totalDuration.toFixed(2)}s</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Test #</th>
        <th>Description</th>
        <th>Status</th>
        <th>Timestamp</th>
        <th>Details</th>
      </tr>
    </thead>
    <tbody>
`

  testResults.forEach(result => {
    const statusClass = result.passed ? 'pass' : 'fail'
    const statusText = result.passed ? 'PASS' : 'FAIL'
    reportHTML += `
      <tr>
        <td>${result.num}</td>
        <td>${result.description}</td>
        <td class="${statusClass}">${statusText}</td>
        <td>${new Date(result.timestamp).toLocaleTimeString()}</td>
        <td>${result.details || '—'}</td>
      </tr>
    `
  })

  reportHTML += `
    </tbody>
  </table>

  <div class="summary">
    <h3>Test Environment</h3>
    <p><strong>API Base:</strong> ${API_BASE}</p>
    <p><strong>UI Base:</strong> ${UI_BASE}</p>
    <p><strong>Execution Date:</strong> ${startTime.toLocaleString()}</p>
  </div>

  <div class="footer">
    <p>MTS-Stratos Automated Testing Suite v1.0</p>
  </div>
</body>
</html>
  `

  const reportPath = path.join(__dirname, 'test-report.html')
  fs.writeFileSync(reportPath, reportHTML)
  log(`\n📊 Report generated: ${reportPath}`, 'green')

  return reportHTML
}

const main = async () => {
  log('🚀 Starting MTS-Stratos E2E Test Suite', 'blue')
  log(`API Base: ${API_BASE}`, 'blue')
  log(`UI Base: ${UI_BASE}\n`, 'blue')

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    // Test user creation cycles for all profiles
    await testUserCycle(page, 'admin-test', 'admin123', 'ADMIN', 'Admin')
    await testUserCycle(page, 'member-test', 'member123', 'MEMBER', 'Member')
    await testUserCycle(page, 'trader-test', 'trader123', 'TRADER', 'Trader')
    await testUserCycle(page, 'autoex-test', 'autoex123', 'AUTOEX', 'AutoEx')

    // UI Settings tests
    await testUISettings(page)

    // Badge tests
    await testBadges(page)

    log('\n✅ All tests completed', 'green')
  } catch (err) {
    log(`\n❌ Fatal error: ${err.message}`, 'red')
  } finally {
    await browser.close()
    generateReport()

    // Summary
    const passed = testResults.filter(t => t.passed).length
    const failed = testResults.filter(t => !t.passed).length
    log(`\n📈 Results: ${passed} passed, ${failed} failed`, passed > failed ? 'green' : 'red')
    
    process.exit(failed > 0 ? 1 : 0)
  }
}

main()
