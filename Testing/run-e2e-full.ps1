Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
Push-Location $root

function Remove-ContainerIfExists {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    $existing = docker ps -a --format "{{.Names}}" | Where-Object { $_ -eq $Name }
    if ($existing) {
        docker rm -f $Name | Out-Null
    }
}

try {
    Write-Host '=== MTS-Stratos E2E Full Run (TC01-TC40) ===' -ForegroundColor Cyan

    Write-Host 'Step 1/6 - Clean containers, network, volumes' -ForegroundColor Yellow
    docker-compose -f docker-compose.master.yml down --volumes --remove-orphans

    Write-Host 'Step 2/6 - Build and recreate core services' -ForegroundColor Yellow
    docker-compose -f docker-compose.master.yml up -d --build --force-recreate postgres redis bondvision-backend bondvision-digital

    Write-Host 'Step 3/6 - Wait services warm-up' -ForegroundColor Yellow
    Start-Sleep -Seconds 12

    Write-Host 'Step 4/6 - Run full E2E suite from TC01' -ForegroundColor Yellow
    Remove-ContainerIfExists -Name 'mts-e2e-full-run'
    docker-compose -f docker-compose.master.yml run --name mts-e2e-full-run -e START_FROM=1 e2e node scripts/e2e-final.mjs

    Write-Host 'Step 5/6 - Export reports to Testing/' -ForegroundColor Yellow
    docker cp mts-e2e-full-run:/app/test-results.csv Testing/test-results.csv
    docker cp mts-e2e-full-run:/app/test-report.html Testing/test-report.html
    docker cp mts-e2e-full-run:/app/test-results.json Testing/test-results.json

    Write-Host 'Step 6/6 - Cleanup transient run container' -ForegroundColor Yellow
    Remove-ContainerIfExists -Name 'mts-e2e-full-run'

    Write-Host '=== DONE ===' -ForegroundColor Green
    Write-Host 'Reports generated:' -ForegroundColor Green
    Write-Host ' - Testing/test-report.html'
    Write-Host ' - Testing/test-results.csv'
    Write-Host ' - Testing/test-results.json'
}
catch {
    Write-Host '=== FAILED ===' -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red

    try {
        Remove-ContainerIfExists -Name 'mts-e2e-full-run'
    }
    catch {
    }

    throw
}
finally {
    Pop-Location
}
