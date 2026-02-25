param(
    [int]$StartFromOverride = 1,
    [int]$SlowMoMs = 0,
    [switch]$Headed,
    [switch]$UsePlaywrightUI,
    [switch]$KeepDbSnapshots,
    [switch]$SkipDbBackupRestore,
    [int]$UiPort = 9323
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $false

$root = Split-Path -Parent $PSScriptRoot
Push-Location $root

$dbContainerName = 'mts-stratos-postgres'
$e2eContainerName = 'mts-stratos-e2e'
$dbName = 'stratos_db'
$dbUser = 'stratos'
$dbPassword = 'stratos2026'
$snapshotDir = Join-Path $root 'Testing/db-snapshots'
$runId = Get-Date -Format 'yyyyMMdd-HHmmss'
$preBackupPath = Join-Path $snapshotDir "pre-hot-e2e-$runId.dump"
$postBackupPath = Join-Path $snapshotDir "post-hot-e2e-$runId.dump"
$dbBackupTaken = $false
$capturedError = $null

function Invoke-Compose {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Args,
        [switch]$Quiet
    )

    $cmd = "docker-compose -f docker-compose.master.yml $Args 2>nul"
    if ($Quiet) {
        cmd /c $cmd | Out-Null
    }
    else {
        cmd /c $cmd
    }

    if ($LASTEXITCODE -ne 0) {
        throw "docker-compose failed: $Args"
    }
}

function Initialize-SnapshotDirectory {
    if (-not (Test-Path $snapshotDir)) {
        New-Item -ItemType Directory -Path $snapshotDir | Out-Null
    }
}

function Wait-PostgresReady {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ContainerName,
        [int]$TimeoutSeconds = 90
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            docker exec $ContainerName sh -lc "PGPASSWORD='$dbPassword' pg_isready -U '$dbUser' -d '$dbName'" | Out-Null
            if ($LASTEXITCODE -eq 0) {
                return
            }
        }
        catch {
        }
        Start-Sleep -Seconds 2
    }

    throw "PostgreSQL non è pronto nel container '$ContainerName' entro ${TimeoutSeconds}s"
}

function Write-DatabaseSnapshot {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ContainerName,
        [Parameter(Mandatory = $true)]
        [string]$OutputPath,
        [Parameter(Mandatory = $true)]
        [string]$Label
    )

    Initialize-SnapshotDirectory
    Invoke-Compose -Args 'up -d postgres' -Quiet
    Wait-PostgresReady -ContainerName $ContainerName

    if (Test-Path $OutputPath) {
        Remove-Item $OutputPath -Force
    }

    $containerDumpPath = '/tmp/hot-e2e-snapshot.dump'
    docker exec $ContainerName sh -lc "PGPASSWORD='$dbPassword' pg_dump -U '$dbUser' -d '$dbName' -Fc -f '$containerDumpPath'"
    if ($LASTEXITCODE -ne 0) {
        throw "pg_dump fallito per snapshot $Label"
    }

    docker cp "$ContainerName`:$containerDumpPath" $OutputPath
    if ($LASTEXITCODE -ne 0) {
        throw "docker cp fallito per snapshot $Label"
    }
}

function Restore-DatabaseState {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ContainerName,
        [Parameter(Mandatory = $true)]
        [string]$InputPath
    )

    if (-not (Test-Path $InputPath)) {
        throw "Backup DB non trovato: $InputPath"
    }

    Invoke-Compose -Args 'stop bondvision-backend' -Quiet
    Wait-PostgresReady -ContainerName $ContainerName

    $containerDumpPath = '/tmp/hot-e2e-restore.dump'
    docker cp $InputPath "$ContainerName`:$containerDumpPath"
    if ($LASTEXITCODE -ne 0) {
        throw 'docker cp restore dump fallito'
    }

    docker exec $ContainerName sh -lc "PGPASSWORD='$dbPassword' pg_restore -U '$dbUser' -d '$dbName' --clean --if-exists --no-owner --no-privileges '$containerDumpPath'"
    if ($LASTEXITCODE -ne 0) {
        throw 'pg_restore fallito'
    }

    try {
        Invoke-Compose -Args 'up -d bondvision-backend' -Quiet
    }
    catch {
        docker start mts-stratos-backend | Out-Null
    }

    $backendRunning = docker ps --format "{{.Names}}" | Where-Object { $_ -eq 'mts-stratos-backend' }
    if (-not $backendRunning) {
        throw 'Riavvio backend fallito dopo restore DB'
    }
}

function Initialize-HotInfrastructure {
    Write-Host 'Ensuring core services + hot e2e container are running...' -ForegroundColor Yellow
    Invoke-Compose -Args 'up -d --build postgres redis bondvision-backend bondvision-digital e2e'
    Start-Sleep -Seconds 4

    $running = docker ps --format "{{.Names}}" | Where-Object { $_ -eq $e2eContainerName }
    if (-not $running) {
        throw "Hot e2e container '$e2eContainerName' non è in esecuzione."
    }
}

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

try {
    Write-Host '=== MTS-Stratos E2E Hot Run ===' -ForegroundColor Cyan

    Initialize-HotInfrastructure
    Sync-E2ERuntimeFiles

    if (-not $SkipDbBackupRestore) {
        Write-Host 'Backup DB pre-run...' -ForegroundColor Yellow
        Write-DatabaseSnapshot -ContainerName $dbContainerName -OutputPath $preBackupPath -Label 'pre-hot-run'
        $dbBackupTaken = $true
        Write-Host "Pre-run snapshot salvato: $preBackupPath" -ForegroundColor Green
    }
    else {
        Write-Host 'Backup/restore DB disabilitato con -SkipDbBackupRestore' -ForegroundColor Yellow
    }

    if ($UsePlaywrightUI) {
        Write-Host "Avvio Playwright UI nel container hot (porta $UiPort)..." -ForegroundColor Green
        Write-Host "Apri: http://localhost:$UiPort" -ForegroundColor Green

        docker exec `
            -e "START_FROM=$StartFromOverride" `
            -e 'API_BASE=http://bondvision-backend:3000/api' `
            -e 'BASE_URL=http://bondvision-digital:3002' `
            $e2eContainerName `
            node ./node_modules/playwright/cli.js test -c playwright-ui.config.mjs --ui --ui-host 0.0.0.0 --ui-port $UiPort

        if ($LASTEXITCODE -ne 0) {
            throw 'Playwright UI execution failed.'
        }
    }
    else {
        $headlessValue = if ($Headed) { 'false' } else { 'true' }
        $liveViewValue = if ($Headed) { 'true' } else { 'false' }
        $modeLabel = if ($Headed) { 'headed' } else { 'headless' }

        Write-Host "Avvio suite hot da T$StartFromOverride (slowMo=${SlowMoMs}ms, $modeLabel)..." -ForegroundColor Green

        docker exec `
            -e "START_FROM=$StartFromOverride" `
            -e "SLOW_MO=$SlowMoMs" `
            -e "HEADLESS=$headlessValue" `
            -e "LIVE_VIEW=$liveViewValue" `
            -e 'STOP_ON_FIRST_FAIL=true' `
            -e 'API_BASE=http://bondvision-backend:3000/api' `
            -e 'BASE_URL=http://bondvision-digital:3002' `
            $e2eContainerName `
            node scripts/e2e-final.mjs
    }

    $runExitCode = $LASTEXITCODE

    if (Test-Path 'Testing') {
        try { $null = docker cp "$e2eContainerName`:/app/test-results.csv" Testing/test-results.csv } catch {}
        try { $null = docker cp "$e2eContainerName`:/app/test-report.html" Testing/test-report.html } catch {}
        try { $null = docker cp "$e2eContainerName`:/app/test-results.json" Testing/test-results.json } catch {}

        if (Test-Path 'Testing/test-results.json') {
            & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'update-test-reports.ps1') -JsonPath 'Testing/test-results.json' -OutputDir 'Testing'
            if ($LASTEXITCODE -ne 0) {
                throw 'Aggiornamento report TEST_* fallito.'
            }
        }
    }

    if ($runExitCode -ne 0) {
        throw 'Hot E2E execution failed.'
    }

    Write-Host 'Run completata. Container e2e resta attivo per i prossimi run.' -ForegroundColor Green
}
catch {
    $capturedError = $_
    Write-Host '=== HOT RUN FAILED ===' -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
finally {
    if ($dbBackupTaken) {
        try {
            if ($KeepDbSnapshots) {
                Write-Host 'Backup DB post-run...' -ForegroundColor Yellow
                Write-DatabaseSnapshot -ContainerName $dbContainerName -OutputPath $postBackupPath -Label 'post-hot-run'
                Write-Host "Post-run snapshot salvato: $postBackupPath" -ForegroundColor Green
            }

            Write-Host 'Restore DB pre-run...' -ForegroundColor Yellow
            Restore-DatabaseState -ContainerName $dbContainerName -InputPath $preBackupPath
            Write-Host 'Restore completato.' -ForegroundColor Green
        }
        catch {
            Write-Host "Restore DB fallito: $($_.Exception.Message)" -ForegroundColor Red
            if ($null -eq $capturedError) {
                $capturedError = $_
            }
        }
    }

    Pop-Location
}

if ($null -ne $capturedError) {
    throw $capturedError
}
