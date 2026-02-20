# Complete Preferences E2E Test
Write-Host "=== PREFERENCES PERSISTENCE E2E TEST ===" -ForegroundColor Cyan

# Step 1: Login
Write-Host "`n[1/4] Logging in..."
$login = '{"username":"admin","password":"admin123"}'
$loginResp = Invoke-WebRequest "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $login -UseBasicParsing
$token = ($loginResp.Content | ConvertFrom-Json).token
Write-Host "      Token: $($token.Substring(0, 20))..." -ForegroundColor Green
$hdr = @{"Authorization"="Bearer $token"; "Content-Type"="application/json"}

# Step 2: Load existing preferences
Write-Host "`n[2/4] Loading existing preferences from backend..."
$loadResp = Invoke-WebRequest "http://localhost:3000/api/preferences/ui_settings" -Headers $hdr -UseBasicParsing
$loaded = $loadResp.Content | ConvertFrom-Json
Write-Host "      Theme: $($loaded.preferences.ui_settings.theme)" -ForegroundColor Green
Write-Host "      Language: $($loaded.preferences.ui_settings.language)" -ForegroundColor Green
Write-Host "      Grid Layout: $($loaded.preferences.ui_settings.gridLayout)" -ForegroundColor Green

# Step 3: Save new preferences (simulating grid changes)
Write-Host "`n[3/4] Saving NEW preferences (simulating grid changes)..."
$newSettings = @{
    theme = 'dark'
    language = 'en'
    gridLayout = 'comfortable'
    defaultColumns = @('isin', 'description', 'price', 'yield')
    lastTab = 'all-bonds'
    columnWidths = @{
        isin = 140
        description = 280
        price = 110
        yield = 110
    }
    filters = @{}
    sorts = @(
        @{ colId = 'yield'; sort = 'asc' }
    )
} | ConvertTo-Json -Depth 5

$saveResp = Invoke-WebRequest "http://localhost:3000/api/preferences/ui_settings" -Method PUT -Headers $hdr -Body $newSettings -UseBasicParsing
$saved = $saveResp.Content | ConvertFrom-Json
Write-Host "      Saved successfully!" -ForegroundColor Green

# Step 4: Reload preferences to verify persistence
Write-Host "`n[4/4] Reloading preferences to verify persistence..."
Start-Sleep -Seconds 1
$reloadResp = Invoke-WebRequest "http://localhost:3000/api/preferences/ui_settings" -Headers $hdr -UseBasicParsing
$reloaded = $reloadResp.Content | ConvertFrom-Json
Write-Host "      Theme: $($reloaded.preferences.ui_settings.theme)" -ForegroundColor Green
Write-Host "      Language: $($reloaded.preferences.ui_settings.language)" -ForegroundColor Green
Write-Host "      Grid Layout: $($reloaded.preferences.ui_settings.gridLayout)" -ForegroundColor Green
Write-Host "      Column widths: $($reloaded.preferences.ui_settings.columnWidths | ConvertTo-Json -Compress)" -ForegroundColor Green

# Verification
Write-Host "`n=== VERIFICATION ===" -ForegroundColor Cyan
if (($reloaded.preferences.ui_settings.theme -eq 'dark') -and ($reloaded.preferences.ui_settings.language -eq 'en') -and ($reloaded.preferences.ui_settings.gridLayout -eq 'comfortable')) {
    Write-Host "PASSED: Preferences persisted and loaded correctly!" -ForegroundColor Green
} else {
    Write-Host "FAILED: Preferences mismatch" -ForegroundColor Red
}
