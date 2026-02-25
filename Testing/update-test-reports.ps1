param(
    [string]$JsonPath = 'Testing/test-results.json',
    [string]$OutputDir = 'Testing'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
Push-Location $root

function Get-TestNumber {
    param([Parameter(Mandatory = $true)][string]$TestId)
    if ($TestId -match '^T(\d+)$') {
        return [int]$Matches[1]
    }
    return 9999
}

function Format-IsoDate {
    param([string]$IsoString)
    if (-not $IsoString) { return (Get-Date -Format 'yyyy-MM-dd') }
    try {
        return ([datetime]$IsoString).ToString('yyyy-MM-dd')
    }
    catch {
        return ($IsoString -replace 'T.*', '')
    }
}

function Update-TestMarkdownFiles {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ResolvedJsonPath,
        [Parameter(Mandatory = $true)]
        [string]$ResolvedOutputDir
    )

    $json = Get-Content -Raw -Path $ResolvedJsonPath | ConvertFrom-Json
    $tests = @($json.tests | Sort-Object { Get-TestNumber -TestId $_.id })
    $summary = $json.summary

    if (-not (Test-Path $ResolvedOutputDir)) {
        New-Item -ItemType Directory -Path $ResolvedOutputDir | Out-Null
    }

    $total = [int]$summary.totalTests
    $passed = [int]$summary.passed
    $failed = [int]$summary.failed
    $notRun = [Math]::Max(0, 47 - $total)
    $avgDuration = if ($total -gt 0) { [Math]::Round(([double]$summary.durationMs / $total), 0) } else { 0 }
    $slowest = $tests | Sort-Object duration -Descending | Select-Object -First 1
    $fastest = $tests | Sort-Object duration | Select-Object -First 1

    $checklist = @()
    $checklist += '# MTS-Stratos Test Checklist'
    $checklist += ''
    $checklist += "**Data creazione**: 2026-02-20  "
    $checklist += "**Ultima esecuzione**: $(Format-IsoDate -IsoString $summary.startTime)  "
    $checklist += '**Timeout per test**: 10 secondi  '
    $checklist += "**Totale test**: $total  "
    $checklist += '**Focus**: GUI con API secondarie'
    $checklist += ''
    $checklist += '---'
    $checklist += ''
    $checklist += '| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |'
    $checklist += '|----|----|-----|--------|-----------|----------|--------|'

    foreach ($t in $tests) {
        $status = if ($t.status -eq 'PASS' -or $t.status -eq 'FAIL') { '✅ RUN' } else { 'NOT RUN' }
        $duration = if ($null -ne $t.duration) { "$($t.duration) ms" } else { '-' }
        $notes = if ($t.failReason) { $t.failReason } else { '-' }
        $checklist += "| $($t.id) | $($t.description) | $($t.type) | $status | $($t.status) | $duration | $notes |"
    }

    if ($notRun -gt 0) {
        for ($i = $total + 1; $i -le 47; $i++) {
            $id = ('T{0:D2}' -f $i)
            $checklist += "| $id | - | GUI | NOT RUN | - | - | - |"
        }
    }

    $checklist += ''
    $checklist += '## SUMMARY'
    $checklist += ''
    $checklist += "- **Start Time**: $($summary.startTime)"
    $checklist += "- **End Time**: $($summary.endTime)"
    $checklist += "- **Total Duration**: $([Math]::Round(([double]$summary.durationMs/1000),2))s"
    $checklist += "- **Total Tests**: $total"
    $checklist += "- **Passed**: $passed"
    $checklist += "- **Failed**: $failed"
    $checklist += "- **Pass Rate**: $($summary.passRate)"
    $checklist += "- **Average Test Duration**: $avgDuration ms"
    if ($slowest) { $checklist += "- **Slowest Test**: $($slowest.id) ($($slowest.duration) ms)" }
    if ($fastest) { $checklist += "- **Fastest Test**: $($fastest.id) ($($fastest.duration) ms)" }

    $checklist | Out-File -Encoding UTF8 -FilePath (Join-Path $ResolvedOutputDir 'TEST_CHECKLIST.md')

    $plan = @()
    $plan += '# MTS-Stratos Test Plan FINALE - GUI Focused'
    $plan += ''
    $plan += "**Data**: $(Format-IsoDate -IsoString $summary.startTime)  "
    $plan += '**Versione**: FINAL  '
    $plan += '**Timeout**: 10 secondi per test  '
    $plan += '**Focus**: GUI (con API secondarie)  '
    $plan += '**Totale Test**: 47'
    $plan += ''
    $plan += "## Ultimo Esito Esecuzione ($(Format-IsoDate -IsoString $summary.startTime))"
    $plan += ''
    $plan += "- **Suite eseguita**: T01-T$('{0:D2}' -f $total)"
    $plan += "- **Risultato**: $passed PASS, $failed FAIL"
    $plan += "- **Pass rate**: $($summary.passRate)"
    $plan += "- **Durata totale**: $([Math]::Round(([double]$summary.durationMs/1000),2))s"
    $plan += '- **Report generati**:'
    $plan += '   - Testing/test-report.html'
    $plan += '   - Testing/test-results.csv'
    $plan += '   - Testing/test-results.json'
    $plan += '   - Testing/TEST_CHECKLIST.md'
    $plan += '   - Testing/TEST_PLAN.md'
    $plan += '   - Testing/TEST_RESULTS.xlsx'
    $plan += ''
    $plan += '### Stato Run / Pass-Fail'
    $plan += ''
    $plan += '| Campo | Valore |'
    $plan += '|-------|--------|'
    $plan += '| Status | RUN |'
    $plan += "| Pass/Fail | $(if ($failed -eq 0) { 'PASS' } else { 'FAIL' }) |"
    $plan += "| Test eseguiti | $total/47 |"
    $plan += "| Test PASS | $passed |"
    $plan += "| Test FAIL | $failed |"

    $plan | Out-File -Encoding UTF8 -FilePath (Join-Path $ResolvedOutputDir 'TEST_PLAN.md')
}

function Update-TestExcelFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ResolvedJsonPath,
        [Parameter(Mandatory = $true)]
        [string]$ResolvedOutputDir
    )

    $excelScript = Join-Path $root 'bondvision-digital/scripts/generate-excel-report.py'
    if (-not (Test-Path $excelScript)) {
        Write-Warning "Excel generator non trovato: $excelScript"
        return
    }

    $outputXlsx = Join-Path $ResolvedOutputDir 'TEST_RESULTS.xlsx'

    $pythonCandidates = @(
        @{ Cmd = 'python'; Args = @($excelScript, $ResolvedJsonPath, $outputXlsx) },
        @{ Cmd = 'py'; Args = @('-3', $excelScript, $ResolvedJsonPath, $outputXlsx) }
    )

    foreach ($candidate in $pythonCandidates) {
        $command = Get-Command $candidate.Cmd -ErrorAction SilentlyContinue
        if ($null -eq $command) {
            continue
        }

        & $candidate.Cmd @($candidate.Args)
        if ($LASTEXITCODE -eq 0 -and (Test-Path $outputXlsx)) {
            Write-Host 'Updated TEST_RESULTS.xlsx' -ForegroundColor Green
            return
        }
    }

    Write-Warning 'Impossibile aggiornare TEST_RESULTS.xlsx (Python/openpyxl non disponibili o generator fallito).'
}

try {
    $resolvedJsonPath = if ([System.IO.Path]::IsPathRooted($JsonPath)) { $JsonPath } else { Join-Path $root $JsonPath }
    $resolvedOutputDir = if ([System.IO.Path]::IsPathRooted($OutputDir)) { $OutputDir } else { Join-Path $root $OutputDir }

    if (-not (Test-Path $resolvedJsonPath)) {
        throw "Report JSON non trovato: $resolvedJsonPath"
    }

    Update-TestMarkdownFiles -ResolvedJsonPath $resolvedJsonPath -ResolvedOutputDir $resolvedOutputDir
    Write-Host 'Updated TEST_CHECKLIST.md and TEST_PLAN.md' -ForegroundColor Green

    Update-TestExcelFile -ResolvedJsonPath $resolvedJsonPath -ResolvedOutputDir $resolvedOutputDir
}
finally {
    Pop-Location
}
