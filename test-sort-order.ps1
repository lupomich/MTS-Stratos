# Test Sort and Column Order Persistence
Write-Host "=== SORT & COLUMN ORDER PERSISTENCE TEST ===" -ForegroundColor Cyan

$token = (Invoke-WebRequest "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}' -UseBasicParsing).Content | ConvertFrom-Json | Select -ExpandProperty token
$hdr = @{"Authorization"="Bearer $token"; "Content-Type"="application/json"}

# Test 1: Save sort and column order
Write-Host "`n[1] Saving new sort and column order..." -ForegroundColor Yellow
$newPrefs = @{
    theme = 'dark'
    language = 'en'
    gridLayout = 'comfortable'
    defaultColumns = @('price', 'description', 'isin', 'yield')
    columnOrder = @('price', 'description', 'isin', 'yield', 'market', 'ccy', 'minPrice', 'maxPrice', 'avePrice')
    columnWidths = @{
        price = 150
        description = 350
        isin = 140
        yield = 130
    }
    sorts = @(
        @{ colId = 'price'; sort = 'desc' }
    )
    filters = @{}
} | ConvertTo-Json -Depth 5

$saveResp = Invoke-WebRequest "http://localhost:3000/api/preferences/ui_settings" -Method PUT -Headers $hdr -Body $newPrefs -UseBasicParsing
$saved = $saveResp.Content | ConvertFrom-Json
Write-Host "Saved successfully" -ForegroundColor Green

# Test 2: Load and verify
Write-Host "`n[2] Loading preferences..." -ForegroundColor Yellow
$loadResp = Invoke-WebRequest "http://localhost:3000/api/preferences/ui_settings" -Headers $hdr -UseBasicParsing
$loaded = $loadResp.Content | ConvertFrom-Json

Write-Host "`nLoaded data:" -ForegroundColor Green
Write-Host "  Column order: $($loaded.preferences.ui_settings.columnOrder | ConvertTo-Json -Compress)"
Write-Host "  Sort: $($loaded.preferences.ui_settings.sorts | ConvertTo-Json -Compress)"
Write-Host "  Column widths: $($loaded.preferences.ui_settings.columnWidths | ConvertTo-Json -Compress)"

# Verification
Write-Host "`n=== VERIFICATION ===" -ForegroundColor Cyan
$orderMatch = ($loaded.preferences.ui_settings.columnOrder -join ',') -eq 'price,description,isin,yield,market,ccy,minPrice,maxPrice,avePrice'
$sortMatch = $loaded.preferences.ui_settings.sorts[0].colId -eq 'price'
$widthMatch = $loaded.preferences.ui_settings.columnWidths.price -eq 150

Write-Host "Column order persisted: $(if ($orderMatch) { 'PASS' } else { 'FAIL' })" -ForegroundColor $(if ($orderMatch) { 'Green' } else { 'Red' })
Write-Host "Sort persisted: $(if ($sortMatch) { 'PASS' } else { 'FAIL' })" -ForegroundColor $(if ($sortMatch) { 'Green' } else { 'Red' })
Write-Host "Column widths persisted: $(if ($widthMatch) { 'PASS' } else { 'FAIL' })" -ForegroundColor $(if ($widthMatch) { 'Green' } else { 'Red' })

if ($orderMatch -and $sortMatch -and $widthMatch) {
    Write-Host "`nRESULT: ALL TESTS PASSED" -ForegroundColor Green
} else {
    Write-Host "`nRESULT: SOME TESTS FAILED" -ForegroundColor Red
}
