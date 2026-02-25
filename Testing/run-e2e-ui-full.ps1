param(
    [int]$UiPort = 9323,
    [switch]$OpenBrowser,
    [switch]$NoOpenBrowser
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $false

$root = Split-Path -Parent $PSScriptRoot
Push-Location $root

$e2eContainerName = 'mts-stratos-e2e'

function Sync-E2ERuntimeFiles {
    $filesToSync = @(
        @{ Source = (Join-Path $root 'bondvision-digital/scripts/e2e-final.mjs'); Target = '/app/scripts/e2e-final.mjs' },
        @{ Source = (Join-Path $root 'bondvision-digital/playwright-ui.config.mjs'); Target = '/app/playwright-ui.config.mjs' },
        @{ Source = (Join-Path $root 'bondvision-digital/tests-live/full-suite.ui.spec.mjs'); Target = '/app/tests-live/full-suite.ui.spec.mjs' }
    )

    foreach ($item in $filesToSync) {
        if (Test-Path $item.Source) {
            docker cp $item.Source "$e2eContainerName`:$($item.Target)" | Out-Null
            if ($LASTEXITCODE -ne 0) {
                throw "Sync file fallito: $($item.Source) -> $($item.Target)"
            }
        }
    }
}

function Wait-UiReady {
    param(
        [Parameter(Mandatory = $true)]
        [int]$Port,
        [int]$TimeoutSeconds = 30
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$Port" -UseBasicParsing -TimeoutSec 3
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
                return $true
            }
        }
        catch {
        }

        Start-Sleep -Seconds 1
    }

    return $false
}

function Open-UiBrowserMaximized {
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

Write-Host '=== MTS-Stratos E2E Full UI (one command) ===' -ForegroundColor Cyan
Write-Host "Avvio Playwright UI interattiva su http://localhost:$UiPort (richiede click su Run)" -ForegroundColor Green

$shouldOpenBrowser = if ($NoOpenBrowser) { $false } else { $true }
if ($OpenBrowser) {
    $shouldOpenBrowser = $true
}

try {
    docker-compose -f docker-compose.master.yml up -d postgres redis bondvision-backend bondvision-digital e2e
    if ($LASTEXITCODE -ne 0) {
        throw 'Impossibile avviare i servizi richiesti.'
    }

    $running = docker ps --format "{{.Names}}" | Where-Object { $_ -eq $e2eContainerName }
    if (-not $running) {
        throw "Container '$e2eContainerName' non in esecuzione."
    }

    Sync-E2ERuntimeFiles

    docker exec $e2eContainerName sh -lc "pkill -f 'playwright/cli.js test .*--ui' || true" | Out-Null

    docker exec -d $e2eContainerName sh -lc "cd /app; node ./node_modules/playwright/cli.js test -c playwright-ui.config.mjs --ui --ui-host 0.0.0.0 --ui-port $UiPort > /tmp/playwright-ui.log 2>&1"
    if ($LASTEXITCODE -ne 0) {
        throw 'Avvio Playwright UI fallito.'
    }

    if (-not (Wait-UiReady -Port $UiPort -TimeoutSeconds 30)) {
        docker exec $e2eContainerName sh -lc 'tail -n 120 /tmp/playwright-ui.log || true'
        throw "Playwright UI non raggiungibile su http://localhost:$UiPort"
    }

    if ($shouldOpenBrowser) {
        try {
            Open-UiBrowserMaximized -Url "http://localhost:$UiPort"
        }
        catch {
            Write-Host "Impossibile aprire automaticamente il browser su http://localhost:$UiPort" -ForegroundColor Yellow
        }
    }

    Write-Host 'Playwright UI avviata in background (persistente).' -ForegroundColor Green
    if (-not $shouldOpenBrowser) {
        Write-Host "Browser auto-open disabilitato (usa -OpenBrowser o rimuovi -NoOpenBrowser)." -ForegroundColor DarkGray
    }
    Write-Host "Se vuoi vedere i log UI: docker exec $e2eContainerName sh -lc 'tail -n 80 /tmp/playwright-ui.log'" -ForegroundColor DarkGray
}
finally {
    Pop-Location
}
