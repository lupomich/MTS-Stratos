param(
    [int]$StartFromOverride = 1,
    [int]$SlowMoMs = 250,
    [int]$TestTimeoutMs = 30000,
    [switch]$DebugInspector,
    [switch]$UsePlaywrightUI,
    [switch]$OpenLiveBrowser,
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

function Show-ReportRefreshSummary {
    param(
        [Parameter(Mandatory = $true)]
        [string]$TestingDir
    )

    $jsonPath = Join-Path $TestingDir 'test-results.json'
    $csvPath = Join-Path $TestingDir 'test-results.csv'
    $htmlPath = Join-Path $TestingDir 'test-report.html'
    $xlsxPath = Join-Path $TestingDir 'TEST_RESULTS.xlsx'

    if (-not (Test-Path $jsonPath)) {
        Write-Host 'Report summary unavailable: test-results.json not found.' -ForegroundColor Yellow
        return
    }

    try {
        $json = Get-Content -Raw -Path $jsonPath | ConvertFrom-Json
        $startTime = $json.summary.startTime
        $endTime = $json.summary.endTime
        $totalTests = $json.summary.totalTests
        $passed = $json.summary.passed
        $failed = $json.summary.failed

        Write-Host '--- Report refresh summary ---' -ForegroundColor Cyan
        Write-Host "Execution Date (UTC): $startTime"
        Write-Host "End Time (UTC): $endTime"
        Write-Host "Result: $passed PASS / $failed FAIL ($totalTests tests)"

        $artifacts = @($jsonPath, $csvPath, $htmlPath, $xlsxPath)
        foreach ($artifact in $artifacts) {
            if (Test-Path $artifact) {
                $item = Get-Item $artifact
                Write-Host ("Updated: {0} ({1})" -f $item.FullName, $item.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss'))
            }
            else {
                Write-Host ("Missing: {0}" -f $artifact) -ForegroundColor Yellow
            }
        }
    }
    catch {
        Write-Host "Unable to print report refresh summary: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Push-Location $root
try {
    Write-Host '=== MTS-Stratos E2E Live View ===' -ForegroundColor Cyan
    Write-Host 'Ensuring required containers are running (postgres, redis, backend, frontend, pgadmin)...' -ForegroundColor Yellow
    docker-compose -f docker-compose.master.yml up -d postgres redis pgadmin bondvision-backend bondvision-digital
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to start required docker services.'
    }

    Write-Host 'Resetting ALL auth session state for deterministic live run (DB + Redis cache)...' -ForegroundColor Yellow
    docker exec mts-stratos-postgres psql -U stratos -d stratos_db -c "UPDATE users SET is_logged_in = false, active_session_id = NULL, active_session_at = NULL;"
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to reset users session flags in PostgreSQL.'
    }

    docker exec mts-stratos-postgres psql -U stratos -d stratos_db -c "UPDATE user_sessions SET is_active = false WHERE is_active = true;"
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to deactivate active rows in user_sessions.'
    }

    docker exec mts-stratos-redis sh -lc "redis-cli --scan --pattern 'auth:online:*' | xargs -r redis-cli del >/dev/null"
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to clear auth online keys in Redis.'
    }

    $dbResidualRaw = docker exec mts-stratos-postgres psql -U stratos -d stratos_db -t -A -c "SELECT COUNT(*) FROM users WHERE is_logged_in = true OR active_session_id IS NOT NULL OR active_session_at IS NOT NULL;"
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to verify users session flags in PostgreSQL.'
    }
    $dbResidual = [int](($dbResidualRaw | Out-String).Trim())

    $redisResidualRaw = docker exec mts-stratos-redis sh -lc "redis-cli --scan --pattern 'auth:online:*' | wc -l"
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to verify auth online keys in Redis.'
    }
    $redisResidual = [int](($redisResidualRaw | Out-String).Trim())

    Write-Host "Auth cleanup verification -> DB residual sessions: $dbResidual, Redis residual keys: $redisResidual" -ForegroundColor Cyan
    if ($dbResidual -ne 0 -or $redisResidual -ne 0) {
        throw "Auth cleanup incomplete (DB=$dbResidual, Redis=$redisResidual). Aborting live run."
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
            $shouldOpenLiveBrowser = $OpenLiveBrowser -and (-not $NoOpenLiveBrowser)
            if ($shouldOpenLiveBrowser) {
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

            Show-ReportRefreshSummary -TestingDir $testingDir
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
