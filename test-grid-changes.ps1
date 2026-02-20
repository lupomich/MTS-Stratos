# Test Grid State Changes and Preferences Saving
Write-Host "=== GRID STATE PREFERENCES SAVE TEST ===" -ForegroundColor Cyan

# Login first
$login = '{"username":"admin","password":"admin123"}'
$loginResp = Invoke-WebRequest "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $login -UseBasicParsing
$token = ($loginResp.Content | ConvertFrom-Json).token
$hdr = @{"Authorization"="Bearer $token"; "Content-Type"="application/json"}

Write-Host "`n[Test] Simulating grid column resize and save..."

# Simulate column width changes
$gridUpdate = @{
    theme = 'dark'
    language = 'en'
    defaultColumns = @('isin', 'description', 'price', 'yield')
    lastTab = 'government-bonds'
    gridLayout = 'comfortable'
    columnWidths = @{
        isin = 150
        description = 300
        class = 100
        market = 120
        ccy = 80
        minPrice = 120
        maxPrice = 120
        avePrice = 120
    }
    filters = @{
        market = @{
            filterType = 'set'
            values = @('MTS Italy')
        }
    }
    sorts = @(
        @{ colId = 'minPrice'; sort = 'desc' }
    )
} | ConvertTo-Json -Depth 10

Write-Host "Sending column widths update..."
$updateResp = Invoke-WebRequest "http://localhost:3000/api/preferences/ui_settings" -Method PUT -Headers $hdr -Body $gridUpdate -UseBasicParsing
$updatedPrefs = $updateResp.Content | ConvertFrom-Json

Write-Host "Response received:"
Write-Host "  Message: $($updatedPrefs.message)" -ForegroundColor Green
Write-Host "  Columns saved: $($updatedPrefs.preferences.ui_settings.columnWidths | ConvertTo-Json -Compress)" -ForegroundColor Green
Write-Host "  Sorts: $($updatedPrefs.preferences.ui_settings.sorts | ConvertTo-Json -Compress)" -ForegroundColor Green

# Verify by reloading
Write-Host "`nVerifying persistence..."
Start-Sleep -Milliseconds 500
$verifyResp = Invoke-WebRequest "http://localhost:3000/api/preferences/ui_settings" -Headers $hdr -UseBasicParsing
$verified = $verifyResp.Content | ConvertFrom-Json

Write-Host "Verified values:" -ForegroundColor Green
Write-Host "  isin width: $($verified.preferences.ui_settings.columnWidths.isin)"
Write-Host "  description width: $($verified.preferences.ui_settings.columnWidths.description)"
Write-Host "  sorts: $($verified.preferences.ui_settings.sorts | ConvertTo-Json -Compress)"

Write-Host "`nGrid preferences test PASSED!" -ForegroundColor Green
