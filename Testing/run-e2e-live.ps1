param(
    [int]$StartFromOverride = 1,
    [int]$SlowMoMs = 250,
    [switch]$DebugInspector,
    [switch]$UsePlaywrightUI
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$frontendDir = Join-Path $root 'bondvision-digital'

Push-Location $root
try {
    Write-Host '=== MTS-Stratos E2E Live View ===' -ForegroundColor Cyan
    Write-Host 'Ensuring required containers are running (postgres, redis, backend, frontend)...' -ForegroundColor Yellow
    docker-compose -f docker-compose.master.yml up -d postgres redis bondvision-backend bondvision-digital
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to start required docker services.'
    }

    Push-Location $frontendDir
    try {
        if (-not (Test-Path 'node_modules')) {
            Write-Host 'Installing npm dependencies (first run)...' -ForegroundColor Yellow
            npm install
            if ($LASTEXITCODE -ne 0) {
                throw 'npm install failed.'
            }
        }

        $playwrightCli = Join-Path (Get-Location) 'node_modules/playwright/cli.js'
        if (-not (Test-Path $playwrightCli)) {
            Write-Host 'Playwright package not found, installing...' -ForegroundColor Yellow
            npm install --no-audit playwright@^1.58.2
            if ($LASTEXITCODE -ne 0) {
                throw 'Unable to install playwright package.'
            }
            $playwrightCli = Join-Path (Get-Location) 'node_modules/playwright/cli.js'
            if (-not (Test-Path $playwrightCli)) {
                throw 'Playwright CLI not found after install.'
            }
        }

        Write-Host 'Ensuring Playwright Chromium browser is installed...' -ForegroundColor Yellow
        node $playwrightCli install chromium
        if ($LASTEXITCODE -ne 0) {
            throw 'Playwright browser installation failed.'
        }

        $env:BASE_URL = 'http://localhost:3002'
        $env:API_BASE = 'http://localhost:3000/api'
        $env:START_FROM = "$StartFromOverride"
        $env:HEADLESS = 'false'
        $env:LIVE_VIEW = 'true'
        $env:SLOW_MO = "$SlowMoMs"

        if ($DebugInspector) {
            $env:PWDEBUG = '1'
            Write-Host 'Inspector enabled (PWDEBUG=1).' -ForegroundColor Green
        }
        else {
            Remove-Item Env:PWDEBUG -ErrorAction SilentlyContinue
        }

        if ($UsePlaywrightUI) {
            Write-Host "Starting Playwright UI mode from T$StartFromOverride (slowMo=${SlowMoMs}ms)..." -ForegroundColor Green
            npm run e2e:ui
        }
        else {
            Write-Host "Starting live E2E from T$StartFromOverride (slowMo=${SlowMoMs}ms)..." -ForegroundColor Green
            npm run e2e:live
        }

        if ($LASTEXITCODE -ne 0) {
            throw 'Live E2E run failed.'
        }
    }
    finally {
        Pop-Location
    }
}
finally {
    Pop-Location
}
