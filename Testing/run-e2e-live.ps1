param(
    [int]$StartFromOverride = 1,
    [int]$SlowMoMs = 250,
    [int]$TestTimeoutMs = 30000,
    [switch]$DebugInspector,
    [switch]$UsePlaywrightUI,
    [switch]$NoOpenLiveBrowser
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$frontendDir = Join-Path $root 'bondvision-digital'

function Open-LiveBrowserMaximized {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Url
    )

    $candidates = @(
        @{ Path = "$Env:ProgramFiles\Google\Chrome\Application\chrome.exe"; Args = @('--new-window', '--start-maximized', $Url) },
        @{ Path = "$Env:ProgramFiles (x86)\Google\Chrome\Application\chrome.exe"; Args = @('--new-window', '--start-maximized', $Url) },
        @{ Path = "$Env:LocalAppData\Google\Chrome\Application\chrome.exe"; Args = @('--new-window', '--start-maximized', $Url) },
        @{ Path = "$Env:ProgramFiles (x86)\Microsoft\Edge\Application\msedge.exe"; Args = @('--new-window', '--start-maximized', $Url) },
        @{ Path = "$Env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"; Args = @('--new-window', '--start-maximized', $Url) }
    )

    foreach ($candidate in $candidates) {
        if (Test-Path $candidate.Path) {
            Start-Process -FilePath $candidate.Path -ArgumentList $candidate.Args | Out-Null
            return
        }
    }

    Start-Process $Url | Out-Null
}

Push-Location $root
try {
    Write-Host '=== MTS-Stratos E2E Live View ===' -ForegroundColor Cyan
    Write-Host 'Ensuring required containers are running (postgres, redis, backend, frontend, pgadmin)...' -ForegroundColor Yellow
    docker-compose -f docker-compose.master.yml up -d postgres redis pgadmin bondvision-backend bondvision-digital
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
        $env:TEST_TIMEOUT = "$TestTimeoutMs"

        if ($DebugInspector) {
            $env:PWDEBUG = '1'
            Write-Host 'Inspector enabled (PWDEBUG=1).' -ForegroundColor Green
        }
        else {
            Remove-Item Env:PWDEBUG -ErrorAction SilentlyContinue
        }

        if ($UsePlaywrightUI) {
            Write-Host "Starting Playwright UI mode from T$StartFromOverride (slowMo=${SlowMoMs}ms, timeout=${TestTimeoutMs}ms)..." -ForegroundColor Green
            npm run e2e:ui
        }
        else {
            if (-not $NoOpenLiveBrowser) {
                try {
                    Open-LiveBrowserMaximized -Url 'http://localhost:3002'
                    Write-Host 'Live browser opened in separate maximized window: http://localhost:3002' -ForegroundColor Green
                }
                catch {
                    Write-Host 'Unable to auto-open maximized live browser window.' -ForegroundColor Yellow
                }
            }

            Write-Host "Starting live E2E from T$StartFromOverride (slowMo=${SlowMoMs}ms, timeout=${TestTimeoutMs}ms)..." -ForegroundColor Green
            npm run e2e:live
        }

        $runExitCode = $LASTEXITCODE

        $testingDir = Join-Path $root 'Testing'
        if (-not (Test-Path $testingDir)) {
            New-Item -ItemType Directory -Path $testingDir | Out-Null
        }

        $frontendJson = Join-Path (Get-Location) 'test-results.json'
        $frontendCsv = Join-Path (Get-Location) 'test-results.csv'
        $frontendHtml = Join-Path (Get-Location) 'test-report.html'

        if (Test-Path $frontendJson) { Copy-Item -Force $frontendJson (Join-Path $testingDir 'test-results.json') }
        if (Test-Path $frontendCsv) { Copy-Item -Force $frontendCsv (Join-Path $testingDir 'test-results.csv') }
        if (Test-Path $frontendHtml) { Copy-Item -Force $frontendHtml (Join-Path $testingDir 'test-report.html') }

        if (Test-Path (Join-Path $testingDir 'test-results.json')) {
            & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $root 'Testing/update-test-reports.ps1') -JsonPath 'Testing/test-results.json' -OutputDir 'Testing'
            if ($LASTEXITCODE -ne 0) {
                throw 'Aggiornamento report TEST_* fallito dopo live run.'
            }
        }

        if ($runExitCode -ne 0) {
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
