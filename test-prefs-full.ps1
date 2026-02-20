# Full preferences persistence test
$login = '{"username":"admin","password":"admin123"}'
$loginResp = Invoke-WebRequest "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $login -UseBasicParsing
$token = ($loginResp.Content | ConvertFrom-Json).token
Write-Host "✓ Login successful"

# Test 1: Load initial preferences
$hdr = @{"Authorization"="Bearer $token"}
$getResp1 = Invoke-WebRequest "http://localhost:3000/api/preferences/ui_settings" -Headers $hdr -UseBasicParsing
$prefs1 = $getResp1.Content | ConvertFrom-Json
Write-Host "`n✓ Initial preferences loaded:"
Write-Host ($prefs1.preferences.ui_settings | ConvertTo-Json)

# Test 2: Save new preferences
$newPrefs = @{
    theme = 'light'
    language = 'it'
    defaultColumns = @('isin', 'description', 'price')
    lastTab = 'government-bonds'
    gridLayout = 'compact'
    columnWidths = @{
        isin = 150
        description = 250
        price = 120
        yield = 120
    }
    filters = @{
        isin = @{ "filterType"="text"; "type"="contains"; "filter"="IT" }
    }
    sorts = @(
        @{ colId = 'price'; sort = 'desc' }
    )
}
$putBody = $newPrefs | ConvertTo-Json -Depth 5
Write-Host "`n✓ Saving new preferences..."
$putResp = Invoke-WebRequest "http://localhost:3000/api/preferences/ui_settings" -Method PUT -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} -Body ([System.Text.Encoding]::UTF8.GetBytes($putBody)) -UseBasicParsing
$putResult = $putResp.Content | ConvertFrom-Json
Write-Host "✓ Saved. Server response:"
Write-Host ($putResult | ConvertTo-Json -Depth 3)

# Test 3: Load preferences again to verify persistence
Start-Sleep -Seconds 1
$getResp2 = Invoke-WebRequest "http://localhost:3000/api/preferences/ui_settings" -Headers $hdr -UseBasicParsing
$prefs2 = $getResp2.Content | ConvertFrom-Json
Write-Host "`n✓ Reloaded preferences from DB:"
Write-Host ($prefs2.preferences.ui_settings | ConvertTo-Json -Depth 3)

# Verify they match
if (($prefs2.preferences.ui_settings.theme -eq 'light') -and ($prefs2.preferences.ui_settings.language -eq 'it')) {
    Write-Host "`n✅ SUCCESS: Preferences persisted correctly in database!"
} else {
    Write-Host "`n❌ FAILED: Preferences not persisted correctly"
}
