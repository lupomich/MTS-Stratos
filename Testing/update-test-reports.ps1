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

function ConvertTo-CET {
    param([string]$IsoString)
    if (-not $IsoString) { return '' }
    try {
        $utc = [datetime]::Parse($IsoString, $null, [System.Globalization.DateTimeStyles]::RoundtripKind)
        $tz = [System.TimeZoneInfo]::FindSystemTimeZoneById('Central European Standard Time')
        $cet = [System.TimeZoneInfo]::ConvertTimeFromUtc($utc, $tz)
        $abbr = if ($tz.IsDaylightSavingTime($cet)) { 'CEST' } else { 'CET' }
        return $cet.ToString('yyyy-MM-dd HH:mm:ss') + ' ' + $abbr
    }
    catch {
        return $IsoString
    }
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

    $runIds = @($tests | ForEach-Object { $_.id })
    for ($i = 1; $i -le 47; $i++) {
        $id = ('T{0:D2}' -f $i)
        if ($runIds -notcontains $id) {
            $checklist += "| $id | - | GUI | NOT RUN | - | - | - |"
        }
    }

    $checklist += ''
    $checklist += '## SUMMARY'
    $checklist += ''
    $cetStart = ConvertTo-CET -IsoString $summary.startTime
    $cetEnd = ConvertTo-CET -IsoString $summary.endTime
    $checklist += "- **Start Time**: $cetStart (UTC: $($summary.startTime))"
    $checklist += "- **End Time**: $cetEnd (UTC: $($summary.endTime))"
    $checklist += "- **Total Duration**: $([Math]::Round(([double]$summary.durationMs/1000),2))s"
    $checklist += "- **Total Tests**: $total"
    $checklist += "- **Passed**: $passed"
    $checklist += "- **Failed**: $failed"
    $checklist += "- **Pass Rate**: $($summary.passRate)"
    $checklist += "- **Average Test Duration**: $avgDuration ms"
    if ($slowest) { $checklist += "- **Slowest Test**: $($slowest.id) ($($slowest.duration) ms)" }
    if ($fastest) { $checklist += "- **Fastest Test**: $($fastest.id) ($($fastest.duration) ms)" }

    $checklistPath = Join-Path $ResolvedOutputDir 'TEST_CHECKLIST.md'
    [System.IO.File]::WriteAllText($checklistPath, ($checklist -join "`n"), (New-Object System.Text.UTF8Encoding $false))

    # Update only the RUN_SUMMARY section inside the existing TEST_PLAN.md
    $planPath = Join-Path $ResolvedOutputDir 'TEST_PLAN.md'
    $cetStart = ConvertTo-CET -IsoString $summary.startTime
    $cetEnd = ConvertTo-CET -IsoString $summary.endTime
    $summaryLines = @()
    $summaryLines += "- **Data esecuzione**: $(Format-IsoDate -IsoString $summary.startTime)"
    $summaryLines += "- **Start Time**: $cetStart (UTC: $($summary.startTime))"
    $summaryLines += "- **End Time**: $cetEnd (UTC: $($summary.endTime))"
    $summaryLines += "- **Suite eseguita**: T01-T$(('{0:D2}' -f $total))"
    $summaryLines += "- **Risultato**: $passed PASS, $failed FAIL"
    $summaryLines += "- **Pass rate**: $($summary.passRate)"
    $summaryLines += "- **Durata totale**: $([Math]::Round(([double]$summary.durationMs/1000),2))s"
    $summaryLines += '- **Report generati**:'
    $summaryLines += '   - Testing/test-report.html'
    $summaryLines += '   - Testing/test-results.csv'
    $summaryLines += '   - Testing/test-results.json'
    $summaryLines += '   - Testing/TEST_CHECKLIST.md'
    $summaryLines += '   - Testing/TEST_PLAN.md'
    $summaryLines += '   - Testing/TEST_RESULTS.xlsx'
    $summaryLines += ''
    $summaryLines += '### Stato Run / Pass-Fail'
    $summaryLines += ''
    $summaryLines += '| Campo | Valore |'
    $summaryLines += '|-------|--------|'
    $summaryLines += '| Status | RUN |'
    $summaryLines += "| Pass/Fail | $(if ($failed -eq 0) { 'PASS' } else { 'FAIL' }) |"
    $summaryLines += "| Test eseguiti | $total/47 |"
    $summaryLines += "| Test PASS | $passed |"
    $summaryLines += "| Test FAIL | $failed |"

    if (Test-Path $planPath) {
        $planContent = [System.IO.File]::ReadAllText($planPath)
        $startMarker = '<!-- RUN_SUMMARY_START -->'
        $endMarker = '<!-- RUN_SUMMARY_END -->'
        $startIdx = $planContent.IndexOf($startMarker)
        $endIdx = $planContent.IndexOf($endMarker)
        if ($startIdx -ge 0 -and $endIdx -gt $startIdx) {
            $before = $planContent.Substring(0, $startIdx + $startMarker.Length)
            $after = $planContent.Substring($endIdx)
            $newSummary = "`n" + ($summaryLines -join "`n") + "`n"
            $planContent = $before + $newSummary + $after
            [System.IO.File]::WriteAllText($planPath, $planContent, (New-Object System.Text.UTF8Encoding $false))
        } else {
            Write-Warning 'TEST_PLAN.md: RUN_SUMMARY markers not found -- file not updated.'
        }
    } else {
        Write-Warning "TEST_PLAN.md not found at $planPath -- skipping plan update."
    }
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
