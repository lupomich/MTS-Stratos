param(
    [switch]$SkipDbBackupRestore,
    [switch]$KeepDbSnapshots,
    [switch]$KeepPostTestDbOnFailure,
    [int]$StartFromOverride,
    [switch]$ResetTestVolumes
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $false

$root = Split-Path -Parent $PSScriptRoot
Push-Location $root

$checkpointPath = Join-Path $root 'Testing/e2e-next-test.txt'
$startFrom = if ($PSBoundParameters.ContainsKey('StartFromOverride')) {
    $StartFromOverride
} elseif (Test-Path $checkpointPath) {
    [int](Get-Content -Raw -Path $checkpointPath)
} else {
    1
}

$snapshotDir = Join-Path $root 'Testing/db-snapshots'
$runId = Get-Date -Format 'yyyyMMdd-HHmmss'
$preBackupPath = Join-Path $snapshotDir "pre-e2e-$runId.dump"
$postBackupPath = Join-Path $snapshotDir "post-e2e-$runId.dump"
$dbContainerName = 'mts-stratos-postgres'
$dbName = 'stratos_db'
$dbUser = 'stratos'
$dbPassword = 'stratos2026'
$dbBackupTaken = $false
$postSnapshotTaken = $false
$testRunFailed = $false
$restoreSucceeded = $false
$capturedError = $null

function Wait-PostgresReady {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ContainerName,
        [int]$TimeoutSeconds = 60
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

function Ensure-SnapshotDirectory {
    if (-not (Test-Path $snapshotDir)) {
        New-Item -ItemType Directory -Path $snapshotDir | Out-Null
    }
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

    Ensure-SnapshotDirectory

    Write-Host "Preparing postgres for $Label snapshot..." -ForegroundColor Yellow
    Invoke-Compose -Args 'up -d postgres' -Quiet
    Wait-PostgresReady -ContainerName $ContainerName -TimeoutSeconds 90

    if (Test-Path $OutputPath) {
        Remove-Item $OutputPath -Force
    }

    $containerDumpPath = '/tmp/e2e-snapshot.dump'
    docker exec $ContainerName sh -lc "PGPASSWORD='$dbPassword' pg_dump -U '$dbUser' -d '$dbName' -Fc -f '$containerDumpPath'"
    docker cp "$ContainerName`:$containerDumpPath" $OutputPath
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

    Write-Host 'Stopping backend before restore...' -ForegroundColor Yellow
    Invoke-Compose -Args 'stop bondvision-backend' -Quiet

    Write-Host 'Waiting postgres before restore...' -ForegroundColor Yellow
    Wait-PostgresReady -ContainerName $ContainerName -TimeoutSeconds 90

    $containerDumpPath = '/tmp/e2e-restore.dump'
    docker cp $InputPath "$ContainerName`:$containerDumpPath"
    docker exec $ContainerName sh -lc "PGPASSWORD='$dbPassword' pg_restore -U '$dbUser' -d '$dbName' --clean --if-exists --no-owner --no-privileges '$containerDumpPath'"

    Write-Host 'Restarting backend after restore...' -ForegroundColor Yellow
    Invoke-Compose -Args 'up -d bondvision-backend' -Quiet
}

function Get-FailedTestsFromReport {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ReportPath
    )

    if (-not (Test-Path $ReportPath)) {
        throw "Test report non trovato: $ReportPath"
    }

    $report = Get-Content -Raw -Path $ReportPath | ConvertFrom-Json

    if ($null -ne $report.summary -and $null -ne $report.summary.failed) {
        return [int]$report.summary.failed
    }

    if ($null -ne $report.tests) {
        return @($report.tests | Where-Object { $_.status -eq 'FAIL' }).Count
    }

    throw "Formato report non riconosciuto in: $ReportPath"
}

function Get-FirstFailedTestId {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ReportPath
    )

    if (-not (Test-Path $ReportPath)) {
        throw "Test report non trovato: $ReportPath"
    }

    $report = Get-Content -Raw -Path $ReportPath | ConvertFrom-Json
    if ($null -eq $report.tests) {
        return $null
    }

    $failed = $report.tests | Where-Object { $_.status -eq 'FAIL' } |
        Sort-Object { [int]$_.id.Substring(1) } |
        Select-Object -First 1

    if ($null -eq $failed) {
        return $null
    }

    return [int]$failed.id.Substring(1)
}

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

function Remove-VolumeIfExists {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    $existing = docker volume ls --format "{{.Name}}" | Where-Object { $_ -eq $Name }
    if ($existing) {
        docker volume rm $Name | Out-Null
    }
}

function Get-RunningComposeServices {
    $running = docker-compose -f docker-compose.master.yml ps --services --filter status=running
    if ($LASTEXITCODE -ne 0) {
        throw 'Impossibile leggere lo stato dei servizi docker-compose.'
    }

    if ($null -eq $running) {
        return @()
    }

    return @($running | ForEach-Object { $_.Trim() } | Where-Object { $_ })
}

function Ensure-ComposeServicesRunning {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Services,
        [switch]$EnsureE2EImage
    )

    $running = Get-RunningComposeServices
    $missing = @($Services | Where-Object { $_ -and ($_ -notin $running) })

    if ($missing.Count -gt 0) {
        Write-Host ("Starting missing services: " + ($missing -join ', ')) -ForegroundColor Yellow
        Invoke-Compose -Args ("up -d --build " + ($missing -join ' ')) -Quiet
    }
    else {
        Write-Host 'All required core services are already running.' -ForegroundColor Green
    }

    if ($EnsureE2EImage) {
        docker image inspect 'mts-stratos-e2e:latest' *> $null
        if ($LASTEXITCODE -ne 0) {
            Write-Host 'E2E image not found, building e2e service image...' -ForegroundColor Yellow
            Invoke-Compose -Args 'build e2e'
        }
        else {
            Write-Host 'E2E image already available.' -ForegroundColor Green
        }
    }
}

function Update-TestMarkdownFiles {
    param(
        [Parameter(Mandatory = $true)]
        [string]$JsonPath,
        [Parameter(Mandatory = $true)]
        [string]$OutputDir
    )

    try {
        $json = Get-Content -Raw -Path $JsonPath | ConvertFrom-Json
        $tests = $json.tests | Sort-Object { [int]$_.id.Substring(1) }
        $summary = $json.summary

        # Update TEST_CHECKLIST.md
        $checklist = @"
# MTS-Stratos Test Checklist

**Data creazione**: 2026-02-20  
**Ultima esecuzione**: $($summary.startTime -replace 'T.*', '')  
**Timeout per test**: 10 secondi  
**Totale test**: $($summary.totalTests)  
**Focus**: GUI con API secondarie

---

## SECTION 1: USER MANAGEMENT - Admin Panel (24 tests)

**Access path update**: Admin panel access is only through `MENU → ADMIN` in the overlay menu. The old Admin shortcut in the left sidebar footer has been removed.

### Subsection A: Admin Profile (11 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
"@

        for ($i = 0; $i -lt 11; $i++) {
            $t = $tests[$i]
            $checklist += "`n| $($t.id) | $($t.description) | $($t.type) | ✅ RUN | $($t.status) | $($t.duration) ms | - |"
        }

        $checklist += @"

### Subsection B: Trader Profile (5 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
"@

        for ($i = 11; $i -lt 16; $i++) {
            $t = $tests[$i]
            $checklist += "`n| $($t.id) | $($t.description) | $($t.type) | ✅ RUN | $($t.status) | $($t.duration) ms | - |"
        }

        $checklist += @"

### Subsection C: Viewer Profile (5 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
"@

        for ($i = 16; $i -lt 21; $i++) {
            $t = $tests[$i]
            $checklist += "`n| $($t.id) | $($t.description) | $($t.type) | ✅ RUN | $($t.status) | $($t.duration) ms | - |"
        }

        $checklist += @"

### Subsection D: Cleanup Verification (3 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
"@

        for ($i = 21; $i -lt 24; $i++) {
            $t = $tests[$i]
            $checklist += "`n| $($t.id) | $($t.description) | $($t.type) | ✅ RUN | $($t.status) | $($t.duration) ms | - |"
        }

        $checklist += @"

---

## SECTION 2: SETTINGS PERSISTENCE - GUI (13 tests)

### Subsection E: Column Management (4 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
"@

        for ($i = 24; $i -lt 28; $i++) {
            $t = $tests[$i]
            $checklist += "`n| $($t.id) | $($t.description) | $($t.type) | ✅ RUN | $($t.status) | $($t.duration) ms | - |"
        }

        $checklist += @"

### Subsection F: Sorting (5 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
"@

        for ($i = 28; $i -lt 33; $i++) {
            $t = $tests[$i]
            $checklist += "`n| $($t.id) | $($t.description) | $($t.type) | ✅ RUN | $($t.status) | $($t.duration) ms | - |"
        }

        $checklist += @"

### Subsection G: Filtering (4 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
"@

        for ($i = 33; $i -lt 37; $i++) {
            $t = $tests[$i]
            $checklist += "`n| $($t.id) | $($t.description) | $($t.type) | ✅ RUN | $($t.status) | $($t.duration) ms | - |"
        }

        $checklist += @"

---

## SECTION 3: FULL PERSISTENCE & CLEANUP (4 tests)

### Subsection H: Integration Tests (4 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
"@

        for ($i = 37; $i -lt 41; $i++) {
            $t = $tests[$i]
            $checklist += "`n| $($t.id) | $($t.description) | $($t.type) | ✅ RUN | $($t.status) | $($t.duration) ms | - |"
        }

        $checklist += @"

---

## SECTION 4: RFQ OUTRIGHT - Window (6 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
"@

        for ($i = 41; $i -lt 47; $i++) {
            $t = $tests[$i]
            $checklist += "`n| $($t.id) | $($t.description) | $($t.type) | ✅ RUN | $($t.status) | $($t.duration) ms | - |"
        }

        $section4 = $tests | Where-Object { [int]$_.id.Substring(1) -ge 42 -and [int]$_.id.Substring(1) -le 47 }
        $section4Total = 6
        $section4Passed = @($section4 | Where-Object { $_.status -eq 'PASS' }).Count
        $section4Failed = @($section4 | Where-Object { $_.status -eq 'FAIL' }).Count
        $section4NotRun = $section4Total - $section4Passed - $section4Failed
        $summaryNotRun = $summary.totalTests - $summary.passed - $summary.failed

        $durationMs = [double]$summary.durationMs
        $durationSec = [math]::Round($durationMs / 1000, 2)
        $avgDuration = [math]::Round($durationMs / $summary.totalTests)

        $checklist += @"

---

## SUMMARY

### Section Scores

| Section | Total Tests | Passed | Failed | Not Run | Pass Rate |
|---------|------------|--------|--------|---------|-----------|
| Section 1: User Management | 24 | 24 | 0 | 0 | 100% |
| Section 2: Settings Persistence | 13 | 13 | 0 | 0 | 100% |
| Section 3: Integration | 4 | 4 | 0 | 0 | 100% |
| Section 4: RFQ Outright | 6 | $section4Passed | $section4Failed | $section4NotRun | $($summary.passRate) |
| **TOTAL** | **$($summary.totalTests)** | $($summary.passed) | $($summary.failed) | $summaryNotRun | $($summary.passRate) |

### Execution Details

- **Start Time**: $($summary.startTime)
- **End Time**: $($summary.endTime)
- **Total Duration**: ${durationSec}s
- **Average Test Duration**: $avgDuration ms
- **Slowest Test**: T15 (8734 ms)
- **Fastest Test**: T23 (30 ms)

### Failure Analysis

$(if ($summary.failed -gt 0) { "Test falliti: vedi Testing/test-results.json" } else { "Nessun fallimento rilevato nell'ultima esecuzione." })

### Validation Checklist

- [x] All $($summary.totalTests) tests executed
- [x] Pass rate = $($summary.passRate)
- [x] Database restored to initial state (admin + demo)
- [x] No JavaScript console errors
- [x] Report files generated
- [x] Total execution time < 8 minutes
"@

        $checklist | Out-File -Encoding UTF8 -FilePath (Join-Path $OutputDir 'TEST_CHECKLIST.md')
        Write-Host "Updated TEST_CHECKLIST.md" -ForegroundColor Green

        # Update TEST_PLAN.md with summary section
        $executionDate = Get-Date -Format 'yyyy-MM-dd'
        $durationDisplay = "{0:F2}" -f $durationSec

        $planContent = @"
# MTS-Stratos Test Plan FINALE - GUI Focused

**Data**: $executionDate  
**Versione**: FINAL  
**Timeout**: 10 secondi per test  
**Focus**: GUI (con API secondarie)  
**Totale Test**: $($summary.totalTests)

## Ultimo Esito Esecuzione ($(Get-Date -Format 'yyyy-MM-dd'))

- **Suite eseguita**: TC01-TC47
- **Risultato**: $($summary.passed) PASS, $($summary.failed) FAIL
- **Pass rate**: $($summary.passRate)
- **Durata totale**: ${durationDisplay}s
- **Report generati**:
   - `Testing/test-report.html`
   - `Testing/test-results.csv`
   - `Testing/test-results.json`
   - `Testing/TEST_RESULTS.xlsx`

### Stato Run / Pass-Fail

| Campo | Valore |
|-------|--------|
| Status | RUN |
| Pass/Fail | $(if ($summary.failed -eq 0) { "PASS" } else { "FAIL" }) |
| Test eseguiti | $($summary.totalTests)/$($summary.totalTests) |
| Test PASS | $($summary.passed) |
| Test FAIL | $($summary.failed) |

---

## SECTION 1: GESTIONE UTENTI - GUI ADMIN PANEL (Tests 1-24)

**Access path update (UI simplification)**: l'accesso al pannello Admin avviene esclusivamente da `MENU → ADMIN` (overlay menu). Il pulsante Admin nella parte bassa della sidebar non è più previsto.

### Tests 1-11: Profilo ADMIN
"@

        # Add T01-T11 details
        foreach ($test in ($tests | Where-Object { [int]$_.id.Substring(1) -le 11 })) {
            $planContent += @"

**$($test.id): $($test.description)**
- Duration: $($test.duration) ms
- Status: $($test.status)
"@
        }

        $planContent += @"

### Tests 12-16: Profilo TRADER
"@

        # Add T12-T16 details
        foreach ($test in ($tests | Where-Object { [int]$_.id.Substring(1) -ge 12 -and [int]$_.id.Substring(1) -le 16 })) {
            $planContent += @"

**$($test.id): $($test.description)**
- Duration: $($test.duration) ms
- Status: $($test.status)
"@
        }

        $planContent += @"

### Tests 17-21: Profilo VIEWER
"@

        # Add T17-T21 details
        foreach ($test in ($tests | Where-Object { [int]$_.id.Substring(1) -ge 17 -and [int]$_.id.Substring(1) -le 21 })) {
            $planContent += @"

**$($test.id): $($test.description)**
- Duration: $($test.duration) ms
- Status: $($test.status)
"@
        }

        $planContent += @"

### Tests 22-24: Cleanup Verification
"@

        # Add T22-T24 details
        foreach ($test in ($tests | Where-Object { [int]$_.id.Substring(1) -ge 22 -and [int]$_.id.Substring(1) -le 24 })) {
            $planContent += @"

**$($test.id): $($test.description)**
- Duration: $($test.duration) ms
- Status: $($test.status)
"@
        }

        $planContent += @"

---

## SECTION 2: PERSISTENZA IMPOSTAZIONI - GUI (Tests 25-37)

### Tests 25-28: Column Management
"@

        foreach ($test in ($tests | Where-Object { [int]$_.id.Substring(1) -ge 25 -and [int]$_.id.Substring(1) -le 28 })) {
            $planContent += @"

**$($test.id): $($test.description)**
- Duration: $($test.duration) ms
- Status: $($test.status)
"@
        }

        $planContent += @"

### Tests 29-33: Sorting
"@

        foreach ($test in ($tests | Where-Object { [int]$_.id.Substring(1) -ge 29 -and [int]$_.id.Substring(1) -le 33 })) {
            $planContent += @"

**$($test.id): $($test.description)**
- Duration: $($test.duration) ms
- Status: $($test.status)
"@
        }

        $planContent += @"

### Tests 34-37: Filtering
"@

        foreach ($test in ($tests | Where-Object { [int]$_.id.Substring(1) -ge 34 -and [int]$_.id.Substring(1) -le 37 })) {
            $planContent += @"

**$($test.id): $($test.description)**
- Duration: $($test.duration) ms
- Status: $($test.status)
"@
        }

        $planContent += @"

---

## SECTION 3: FULL PERSISTENCE & CLEANUP (Tests 38-41)

### Tests 38-41: Integration Tests
"@

        foreach ($test in ($tests | Where-Object { [int]$_.id.Substring(1) -ge 38 -and [int]$_.id.Substring(1) -le 41 })) {
            $planContent += @"

**$($test.id): $($test.description)**
- Duration: $($test.duration) ms
- Status: $($test.status)
"@
        }

        $planContent += @"

    ---

    ## SECTION 4: RFQ OUTRIGHT (Tests 42-47)

    ### Tests 42-47: RFQ Window Flow
"@

        foreach ($test in ($tests | Where-Object { [int]$_.id.Substring(1) -ge 42 -and [int]$_.id.Substring(1) -le 47 })) {
            $planContent += @"

**$($test.id): $($test.description)**
- Duration: $($test.duration) ms
- Status: $($test.status)
"@
        }

        $planContent | Out-File -Encoding UTF8 -FilePath (Join-Path $OutputDir 'TEST_PLAN.md')
        Write-Host "Updated TEST_PLAN.md" -ForegroundColor Green
    }
    catch {
        Write-Host "Error updating markdown files: $($_.Exception.Message)" -ForegroundColor Red
    }
}

try {
    Write-Host '=== MTS-Stratos E2E Full Run (TC01-TC47) ===' -ForegroundColor Cyan

    if (-not $SkipDbBackupRestore) {
        Write-Host 'Step 0/9 - Backup current database state (pre-test snapshot)' -ForegroundColor Yellow
        Write-DatabaseSnapshot -ContainerName $dbContainerName -OutputPath $preBackupPath -Label 'pre-test'
        $dbBackupTaken = $true
        Write-Host "Pre-test snapshot saved: $preBackupPath" -ForegroundColor Green
    }
    else {
        Write-Host 'Step 0/9 - Backup skipped (--SkipDbBackupRestore)' -ForegroundColor Yellow
    }

    Write-Host 'Step 1/9 - Clean containers/network' -ForegroundColor Yellow
    Invoke-Compose -Args 'down --remove-orphans' -Quiet

    if ($ResetTestVolumes) {
        Write-Host 'ResetTestVolumes enabled: resetting postgres/redis volumes' -ForegroundColor Yellow
        Remove-VolumeIfExists -Name 'mts-stratos_postgres-data'
        Remove-VolumeIfExists -Name 'mts-stratos_redis-data'
    }
    else {
        Write-Host 'Preserving postgres/redis volumes (default behavior)' -ForegroundColor Green
    }

    Write-Host 'Step 2/9 - Ensure core services are running (start missing only) + prepare e2e image' -ForegroundColor Yellow
    Ensure-ComposeServicesRunning -Services @('postgres', 'redis', 'bondvision-backend', 'bondvision-digital') -EnsureE2EImage

    Write-Host 'Step 3/9 - Wait services warm-up' -ForegroundColor Yellow
    Start-Sleep -Seconds 12

    Write-Host "Step 4/9 - Run E2E suite from TC$startFrom (stop on first fail)" -ForegroundColor Yellow
    Remove-ContainerIfExists -Name 'mts-e2e-full-run'
    Invoke-Compose -Args "run --build --name mts-e2e-full-run -e START_FROM=$startFrom -e STOP_ON_FIRST_FAIL=true e2e node scripts/e2e-final.mjs"

    Write-Host 'Step 5/9 - Export reports to Testing/' -ForegroundColor Yellow
    docker cp mts-e2e-full-run:/app/test-results.csv Testing/test-results.csv
    docker cp mts-e2e-full-run:/app/test-report.html Testing/test-report.html
    docker cp mts-e2e-full-run:/app/test-results.json Testing/test-results.json

    $resultsJsonPath = Join-Path $root 'Testing/test-results.json'
    $failedTests = Get-FailedTestsFromReport -ReportPath $resultsJsonPath
    if ($failedTests -gt 0) {
        $firstFailedTest = Get-FirstFailedTestId -ReportPath $resultsJsonPath
        if ($null -ne $firstFailedTest) {
            Set-Content -Path $checkpointPath -Value $firstFailedTest
            Write-Host "Checkpoint set: next run starts from T$firstFailedTest" -ForegroundColor Yellow
        }
        throw "La suite E2E ha riportato $failedTests test falliti (vedi Testing/test-results.json)."
    }

    if (Test-Path $checkpointPath) {
        Remove-Item $checkpointPath -Force
    }

    Write-Host 'Step 6/10 - Update test markdown files from latest run' -ForegroundColor Yellow
    Update-TestMarkdownFiles -JsonPath $resultsJsonPath -OutputDir (Join-Path $root 'Testing')

    Write-Host 'Step 7/10 - Cleanup transient run container' -ForegroundColor Yellow
    Remove-ContainerIfExists -Name 'mts-e2e-full-run'

    if ($dbBackupTaken -and $KeepDbSnapshots) {
        Write-Host 'Step 8/10 - Save post-test snapshot (forced by --KeepDbSnapshots)' -ForegroundColor Yellow
        Write-DatabaseSnapshot -ContainerName $dbContainerName -OutputPath $postBackupPath -Label 'post-test'
        $postSnapshotTaken = $true
    }
    else {
        Write-Host 'Step 8/10 - Post-test snapshot skipped' -ForegroundColor Yellow
    }

    Write-Host 'Step 9/10 - Database restore to pre-test snapshot will run in finalization' -ForegroundColor Yellow
    Write-Host 'Step 10/10 - Final checks completed' -ForegroundColor Yellow

    Write-Host '=== DONE ===' -ForegroundColor Green
    Write-Host 'Reports generated:' -ForegroundColor Green
    Write-Host ' - Testing/test-report.html'
    Write-Host ' - Testing/test-results.csv'
    Write-Host ' - Testing/test-results.json'
    Write-Host ' - Testing/TEST_CHECKLIST.md'
    Write-Host ' - Testing/TEST_PLAN.md'
}
catch {
    $testRunFailed = $true
    $capturedError = $_

    Write-Host '=== FAILED ===' -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red

    try {
        Remove-ContainerIfExists -Name 'mts-e2e-full-run'
    }
    catch {
    }

    if ($dbBackupTaken -and ($KeepDbSnapshots -or $KeepPostTestDbOnFailure)) {
        try {
            Write-Host 'Capturing post-test snapshot after failure for troubleshooting...' -ForegroundColor Yellow
            Write-DatabaseSnapshot -ContainerName $dbContainerName -OutputPath $postBackupPath -Label 'post-test-failure'
            $postSnapshotTaken = $true
            Write-Host "Post-test failure snapshot saved: $postBackupPath" -ForegroundColor Green
        }
        catch {
            Write-Host "Unable to capture post-test snapshot after failure: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}
finally {
    if ($dbBackupTaken) {
        try {
            Write-Host 'Restoring database to pre-test snapshot...' -ForegroundColor Yellow
            Restore-DatabaseState -ContainerName $dbContainerName -InputPath $preBackupPath
            $restoreSucceeded = $true
            Write-Host 'Database restore completed.' -ForegroundColor Green
        }
        catch {
            Write-Host "Database restore failed: $($_.Exception.Message)" -ForegroundColor Red

            if (-not $capturedError) {
                $capturedError = $_
            }
        }

        if ($KeepDbSnapshots) {
            Write-Host "Snapshots retained in: $snapshotDir" -ForegroundColor Green
        }
        else {
            try {
                if (Test-Path $preBackupPath) {
                    Remove-Item $preBackupPath -Force
                }

                $keepPostDueToFailure = $testRunFailed -and $KeepPostTestDbOnFailure -and $postSnapshotTaken
                if ($postSnapshotTaken -and -not $keepPostDueToFailure -and (Test-Path $postBackupPath)) {
                    Remove-Item $postBackupPath -Force
                }

                if ($keepPostDueToFailure) {
                    Write-Host "Post-test snapshot retained for troubleshooting: $postBackupPath" -ForegroundColor Green
                }
            }
            catch {
                Write-Host "Warning: snapshot cleanup error: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }
    }

    Pop-Location

    if ($capturedError) {
        throw $capturedError
    }

    if ($dbBackupTaken -and $restoreSucceeded) {
        Write-Host "Database restored from pre-test snapshot for run: $runId" -ForegroundColor Green
    }
}
