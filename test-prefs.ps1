# Test preferences endpoint
$login = '{"username":"admin","password":"admin123"}'
$loginResp = Invoke-WebRequest "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $login -UseBasicParsing
$token = ($loginResp.Content | ConvertFrom-Json).token
Write-Host "✓ Login successful, got token: $($token.Substring(0, 20))..."

# Test GET /preferences/ui_settings
Write-Host "`nTesting GET /api/preferences/ui_settings..."
$getResp = Invoke-WebRequest "http://localhost:3000/api/preferences/ui_settings" -Headers @{"Authorization"="Bearer $token"} -UseBasicParsing
$prefs = $getResp.Content | ConvertFrom-Json
Write-Host "✓ Got preferences:" 
Write-Host ($prefs | ConvertTo-Json)

# Test PUT /preferences/ui_settings
Write-Host "`nTesting PUT /api/preferences/ui_settings..."
$newPrefs = @{
    theme = 'light'
    language = 'it'
    defaultColumns = @('isin', 'description', 'price')
    lastTab = 'government-bonds'
    gridLayout = 'compact'
}
$putBody = $newPrefs | ConvertTo-Json
$putResp = Invoke-WebRequest "http://localhost:3000/api/preferences/ui_settings" -Method PUT -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} -Body ([System.Text.Encoding]::UTF8.GetBytes($putBody)) -UseBasicParsing
$putResult = $putResp.Content | ConvertFrom-Json
Write-Host "✓ Preferences saved successfully:"
Write-Host ($putResult | ConvertTo-Json)

Write-Host "`n✓ All preferences endpoint tests passed!"
