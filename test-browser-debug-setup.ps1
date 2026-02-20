# Browser Console Debug Test
# This creates a scenario where preferences are pre-loaded, so we can see
# in the browser dev tools if handleGridReady applies them correctly

Write-Host "=== SETUP FOR BROWSER DEBUG TEST ===" -ForegroundColor Cyan

$token = (Invoke-WebRequest "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}' -UseBasicParsing).Content | ConvertFrom-Json | Select -ExpandProperty token
$hdr = @{"Authorization"="Bearer $token"; "Content-Type"="application/json"}

Write-Host "`n[Setup] Setting up default preferences for test..." -ForegroundColor Yellow

# Create test data with obvious sort and column order
$testPrefs = @{
    theme = 'dark'
    language = 'en'
    gridLayout = 'comfortable'
    columnOrder = @('minPrice', 'description', 'isin')
    columnWidths = @{
        minPrice = 180
        description = 400
        isin = 150
    }
    sorts = @(
        @{ colId = 'minPrice'; sort = 'asc' }
    )
    filters = @{}
    defaultColumns = @('minPrice', 'description', 'isin', 'price', 'yield')
    lastTab = 'government-bonds'
} | ConvertTo-Json -Depth 5

$saveResp = Invoke-WebRequest "http://localhost:3000/api/preferences/ui_settings" -Method PUT -Headers $hdr -Body $testPrefs -UseBasicParsing
Write-Host "Preferences saved to database" -ForegroundColor Green
Write-Host "  - Column Order: minPrice, description, isin"
Write-Host "  - Sort: minPrice ASC"
Write-Host "  - Column Width: minPrice=180, description=400"

Write-Host "`n[Next Steps] Now in browser:" -ForegroundColor Cyan
Write-Host "1. Open http://localhost:3002 in an incognito window" -ForegroundColor White
Write-Host "2. Login with admin/admin123" -ForegroundColor White
Write-Host "3. Open Dev Tools (F12) -> Console" -ForegroundColor White
Write-Host "4. Look for logs like:" -ForegroundColor White
Write-Host "   - 'Applying column order: [minPrice, description, isin]'" -ForegroundColor Gray
Write-Host "   - 'Applying sort model: {sort: asc, colId: minPrice}'" -ForegroundColor Gray
Write-Host "5. Check if the grid columns appear in order: minPrice → description → isin" -ForegroundColor White
Write-Host "6. Check if there's a blue indicator on minPrice (ascending sort)" -ForegroundColor White
Write-Host "`n[Troubleshoot] If they don't appear:" -ForegroundColor Yellow
Write-Host "- Check onGridReady is logged: 'Grid is ready'" -ForegroundColor Gray
Write-Host "- Check preferences loaded: 'Preferences context loaded'" -ForegroundColor Gray
Write-Host "- Check if any errors appear in the console" -ForegroundColor Gray
