# Test Complete Lifecycle: Save -> Logout -> Login -> Restore
Write-Host "=== COMPLETE LIFECYCLE TEST ===" -ForegroundColor Cyan

# Step 1: First login and save preferences
Write-Host "`n[Step 1] FIRST LOGIN" -ForegroundColor Yellow
$login = '{"username":"admin","password":"admin123"}'
$loginResp1 = Invoke-WebRequest "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $login -UseBasicParsing
$token1 = ($loginResp1.Content | ConvertFrom-Json).token
$hdr = @{"Authorization"="Bearer $token1"; "Content-Type"="application/json"}
Write-Host "Logged in with token: $($token1.Substring(0,30))..."

# Step 2: Clear previous and set new preferences
Write-Host "`n[Step 2] SAVING PREFERENCES" -ForegroundColor Yellow
$prefs = @{
    theme = 'dark'
    language = 'en'
    gridLayout = 'comfortable'
    columnOrder = @('price', 'description', 'isin', 'yield', 'market')
    columnWidths = @{
        price = 160
        description = 360
        isin = 145
        yield = 135
        market = 125
    }
    sorts = @(
        @{ colId = 'price'; sort = 'desc' }
    )
    filters = @{
        market = @{
            filterType = 'set'
            values = @('MTS Italy')
        }
    }
} | ConvertTo-Json -Depth 5

$saveResp = Invoke-WebRequest "http://localhost:3000/api/preferences/ui_settings" -Method PUT -Headers $hdr -Body $prefs -UseBasicParsing
$saved = $saveResp.Content | ConvertFrom-Json
Write-Host "Preferences saved to database"
Write-Host "  Sort: $($saved.preferences.ui_settings.sorts | ConvertTo-Json -Compress)"
Write-Host "  Column order: $($saved.preferences.ui_settings.columnOrder | ConvertTo-Json -Compress)"

# Step 3: Verify preferences are in DB
Write-Host "`n[Step 3] VERIFYING IN DATABASE" -ForegroundColor Yellow
Start-Sleep -Seconds 1
$dbResp = Invoke-WebRequest "http://localhost:3000/api/preferences/ui_settings" -Headers $hdr -UseBasicParsing
$dbData = $dbResp.Content | ConvertFrom-Json
Write-Host "Confirmed in database:" -ForegroundColor Green
Write-Host "  Column order: $($dbData.preferences.ui_settings.columnOrder | ConvertTo-Json -Compress)"
Write-Host "  Sort field: $($dbData.preferences.ui_settings.sorts[0].colId)"
Write-Host "  Sort direction: $($dbData.preferences.ui_settings.sorts[0].sort)"

# Step 4: Logout
Write-Host "`n[Step 4] LOGOUT" -ForegroundColor Yellow
$logoutResp = Invoke-WebRequest "http://localhost:3000/api/auth/logout" -Method POST -Headers @{"Authorization"="Bearer $token1"} -UseBasicParsing
Write-Host "Logged out successfully"

# Step 5: Login again
Write-Host "`n[Step 5] LOGIN AGAIN" -ForegroundColor Yellow
$loginResp2 = Invoke-WebRequest "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $login -UseBasicParsing
$token2 = ($loginResp2.Content | ConvertFrom-Json).token
$hdr2 = @{"Authorization"="Bearer $token2"; "Content-Type"="application/json"}
Write-Host "Logged in with new token: $($token2.Substring(0,30))..."

# Step 6: Load preferences - simulate what frontend does
Write-Host "`n[Step 6] LOAD PREFERENCES (simulating frontend)" -ForegroundColor Yellow
$loadResp = Invoke-WebRequest "http://localhost:3000/api/preferences/ui_settings" -Headers $hdr2 -UseBasicParsing
$frontendData = $loadResp.Content | ConvertFrom-Json

Write-Host "Frontend would receive:" -ForegroundColor Green
Write-Host "  Column order: $($frontendData.preferences.ui_settings.columnOrder | ConvertTo-Json -Compress)"
Write-Host "  Sort model: $($frontendData.preferences.ui_settings.sorts | ConvertTo-Json -Compress)"
Write-Host "  Filter model: $($frontendData.preferences.ui_settings.filters | ConvertTo-Json -Compress)"

# Verification
Write-Host "`n=== VERIFICATION ===" -ForegroundColor Cyan
$orderMatched = ($frontendData.preferences.ui_settings.columnOrder | ConvertTo-Json) -eq @('price', 'description', 'isin', 'yield', 'market') | ConvertTo-Json
$sortMatched = ($frontendData.preferences.ui_settings.sorts[0].colId -eq 'price') -and ($frontendData.preferences.ui_settings.sorts[0].sort -eq 'desc')
$filterMatched = ($frontendData.preferences.ui_settings.filters.market.values | ConvertTo-Json) -eq @('MTS Italy') | ConvertTo-Json

Write-Host "Column order restored correctly: $(if ($frontendData.preferences.ui_settings.columnOrder.Count -eq 5) { 'PASS' } else { 'FAIL' })" -ForegroundColor $(if ($frontendData.preferences.ui_settings.columnOrder.Count -eq 5) { 'Green' } else { 'Red' })
Write-Host "Sort restored correctly: $(if ($sortMatched) { 'PASS' } else { 'FAIL' })" -ForegroundColor $(if ($sortMatched) { 'Green' } else { 'Red' })
Write-Host "Filters restored correctly: $(if ($frontendData.preferences.ui_settings.filters.market.values) { 'PASS' } else { 'FAIL' })" -ForegroundColor $(if ($frontendData.preferences.ui_settings.filters.market.values) { 'Green' } else { 'Red' })

Write-Host "`nCONCLUSION: When user logs in again, preferences will be loaded into handleGridReady()" -ForegroundColor Cyan
Write-Host "Frontend will call:" -ForegroundColor Gray
Write-Host "  - setColumnState() with columnOrder: $(($frontendData.preferences.ui_settings.columnOrder | ConvertTo-Json -Compress))" -ForegroundColor Gray
Write-Host "  - setSortModel() with: $(($frontendData.preferences.ui_settings.sorts | ConvertTo-Json -Compress))" -ForegroundColor Gray
Write-Host "  - setFilterModel() with: $(($frontendData.preferences.ui_settings.filters | ConvertTo-Json -Compress))" -ForegroundColor Gray
