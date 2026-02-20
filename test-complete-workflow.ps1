# Complete User Workflow Test
Write-Host "=== COMPLETE USER WORKFLOW TEST ===" -ForegroundColor Cyan
Write-Host "Simulating: Login -> Modify Grid -> Logout -> Login -> Verify Preferences`n" -ForegroundColor Gray

# Step 1: Login
Write-Host "[Step 1] LOGIN" -ForegroundColor Yellow
$login = '{"username":"admin","password":"admin123"}'
$loginResp = Invoke-WebRequest "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $login -UseBasicParsing
$token1 = ($loginResp.Content | ConvertFrom-Json).token
$hdr = @{"Authorization"="Bearer $token1"; "Content-Type"="application/json"}
Write-Host "Logged in successfully`n" -ForegroundColor Green

# Step 2: Load initial preferences
Write-Host "[Step 2] LOAD INITIAL PREFERENCES" -ForegroundColor Yellow
$initResp = Invoke-WebRequest "http://localhost:3000/api/preferences/ui_settings" -Headers $hdr -UseBasicParsing
$initial = $initResp.Content | ConvertFrom-Json
Write-Host "Initial theme: $($initial.preferences.ui_settings.theme)"
Write-Host "Initial sorts: $($initial.preferences.ui_settings.sorts | ConvertTo-Json -Compress)" -ForegroundColor Gray
Write-Host "Initial column widths: $($initial.preferences.ui_settings.columnWidths | ConvertTo-Json -Compress)`n" -ForegroundColor Gray

# Step 3: Simulate user modifying grid (changing theme, sort, column width)
Write-Host "[Step 3] USER MODIFIES GRID" -ForegroundColor Yellow
Write-Host "User action: sorts minPrice DESC, changes theme to light, resizes description column`n" -ForegroundColor Gray

$modified = @{
    theme = 'light'
    language = 'en'
    defaultColumns = @('isin', 'description', 'price', 'yield')
    lastTab = 'all-bonds'
    gridLayout = 'comfortable'
    columnWidths = @{
        isin = 140
        description = 350
        price = 110
        yield = 120
    }
    filters = @{}
    sorts = @(
        @{ colId = 'minPrice'; sort = 'desc' }
    )
} | ConvertTo-Json -Depth 5

$saveResp = Invoke-WebRequest "http://localhost:3000/api/preferences/ui_settings" -Method PUT -Headers $hdr -Body $modified -UseBasicParsing
Write-Host "Grid preferences saved to database`n" -ForegroundColor Green

# Step 4: Simulate logout
Write-Host "[Step 4] LOGOUT" -ForegroundColor Yellow
$logoutResp = Invoke-WebRequest "http://localhost:3000/api/auth/logout" -Method POST -Headers @{"Authorization"="Bearer $token1"} -UseBasicParsing
Write-Host "Logged out`n" -ForegroundColor Green

# Step 5: Login again
Write-Host "[Step 5] LOGIN AGAIN" -ForegroundColor Yellow
$login2 = '{"username":"admin","password":"admin123"}'
$loginResp2 = Invoke-WebRequest "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $login2 -UseBasicParsing
$token2 = ($loginResp2.Content | ConvertFrom-Json).token
$hdr2 = @{"Authorization"="Bearer $token2"; "Content-Type"="application/json"}
Write-Host "Logged in with new session`n" -ForegroundColor Green

# Step 6: Load preferences again
Write-Host "[Step 6] VERIFY PREFERENCES PERSISTED" -ForegroundColor Yellow
$verifyResp = Invoke-WebRequest "http://localhost:3000/api/preferences/ui_settings" -Headers $hdr2 -UseBasicParsing
$verified = $verifyResp.Content | ConvertFrom-Json
Write-Host "Loaded theme: $($verified.preferences.ui_settings.theme)"
Write-Host "Loaded sorts: $($verified.preferences.ui_settings.sorts | ConvertTo-Json -Compress)"
Write-Host "Loaded description width: $($verified.preferences.ui_settings.columnWidths.description)`n" -ForegroundColor Green

# Step 7: Verification
Write-Host "=== VERIFICATION RESULTS ===" -ForegroundColor Cyan
$themeMatch = $verified.preferences.ui_settings.theme -eq 'light'
$sortMatch = $verified.preferences.ui_settings.sorts -and $verified.preferences.ui_settings.sorts[0].colId -eq 'minPrice'
$widthMatch = $verified.preferences.ui_settings.columnWidths.description -eq 350

Write-Host "Theme persisted: $(if ($themeMatch) { 'PASS' } else { 'FAIL' })" -ForegroundColor $(if ($themeMatch) { 'Green' } else { 'Red' })
Write-Host "Sort persisted: $(if ($sortMatch) { 'PASS' } else { 'FAIL' })" -ForegroundColor $(if ($sortMatch) { 'Green' } else { 'Red' })
Write-Host "Column width persisted: $(if ($widthMatch) { 'PASS' } else { 'FAIL' })" -ForegroundColor $(if ($widthMatch) { 'Green' } else { 'Red' })

if ($themeMatch -and $sortMatch -and $widthMatch) {
    Write-Host "`nOVERALL: COMPLETE SUCCESS - All preferences persisted across sessions!" -ForegroundColor Green
} else {
    Write-Host "`nOVERALL: PARTIAL SUCCESS - Some preferences not persisting" -ForegroundColor Yellow
}
