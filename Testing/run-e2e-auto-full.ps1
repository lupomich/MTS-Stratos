Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$hotRunner = Join-Path $PSScriptRoot 'run-e2e-hot.ps1'
if (-not (Test-Path $hotRunner)) {
    throw "Hot runner non trovato: $hotRunner"
}

Write-Host '=== MTS-Stratos E2E Full AUTO (one command) ===' -ForegroundColor Cyan
Write-Host 'Avvio automatico suite completa da T1 (hot/headless, nessun click manuale)' -ForegroundColor Green

& powershell -NoProfile -ExecutionPolicy Bypass -File $hotRunner -StartFromOverride 1 -SlowMoMs 250
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
