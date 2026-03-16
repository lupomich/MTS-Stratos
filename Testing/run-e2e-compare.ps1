# run-e2e-compare.ps1
#
# Runs the full E2E suite twice inside the mts-stratos-e2e container:
#   Round 1 — Node.js frontend (localhost:3001) + Node.js backend (localhost:3000)
#   Round 2 — Java frontend   (localhost:3002) + Java backend   (localhost:3003)
#
# Auth state is reset between the two runs to keep sessions clean.
# Results are saved per-stack under Testing/compare/ and a diff summary is printed.
#
# Prerequisites:
#   Both stacks must be reachable (run with both compose files or pre-started manually):
#     docker compose -f docker-compose.master.yml -f docker-compose.java-backend.yml up -d
#
# Usage:
#   .\Testing\run-e2e-compare.ps1
#   .\Testing\run-e2e-compare.ps1 -StartFrom 5 -TestTimeoutMs 60000

param(
    [int]$StartFrom = 1,
    [int]$TestTimeoutMs = 30000
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root 'Testing\compare'

if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

# ── Helpers ──────────────────────────────────────────────────────────────────

function Reset-AuthState {
    Write-Host '  Resetting auth state (DB + Redis)...' -ForegroundColor Yellow
    docker exec mts-stratos-postgres psql -U stratos -d stratos_db -c `
        "UPDATE users SET is_logged_in = false, active_session_id = NULL, active_session_at = NULL;" | Out-Null
    docker exec mts-stratos-postgres psql -U stratos -d stratos_db -c `
        "UPDATE user_sessions SET is_active = false WHERE is_active = true;" | Out-Null
    docker exec mts-stratos-redis sh -lc `
        "redis-cli --scan --pattern 'auth:online:*' | xargs -r redis-cli del >/dev/null" | Out-Null
    Write-Host '  Auth state clean.' -ForegroundColor Green
}

function Invoke-E2ERun {
    param(
        [string]$Label,
        [string]$BaseUrl,
        [string]$ApiBase
    )

    Write-Host ''
    Write-Host "=== Round: $Label ===" -ForegroundColor Cyan
    Write-Host "  BASE_URL : $BaseUrl"
    Write-Host "  API_BASE : $ApiBase"

    Reset-AuthState

    # Clear stale results from previous run so docker cp only picks up fresh output
    docker exec mts-stratos-e2e sh -c 'rm -f /app/test-results.json /app/test-results.csv /app/test-report.html' 2>$null | Out-Null

    $dockerArgs = @(
        'exec',
        '-e', "BASE_URL=$BaseUrl",

        '-e', "API_BASE=$ApiBase",
        '-e', 'HEADLESS=true',
        '-e', 'LIVE_VIEW=false',
        '-e', "START_FROM=$StartFrom",
        '-e', "TEST_TIMEOUT=$TestTimeoutMs",
        '-e', 'STOP_ON_FIRST_FAIL=false',
        'mts-stratos-e2e',
        'node', 'scripts/e2e-final.mjs'
    )
    & docker @dockerArgs
    $exitCode = $LASTEXITCODE

    # Pull result files out of the container
    $jsonOut = Join-Path $outDir "test-results-$Label.json"
    $csvOut  = Join-Path $outDir "test-results-$Label.csv"
    $htmlOut = Join-Path $outDir "test-report-$Label.html"

    docker cp "mts-stratos-e2e:/app/test-results.json" $jsonOut 2>$null | Out-Null
    docker cp "mts-stratos-e2e:/app/test-results.csv"  $csvOut  2>$null | Out-Null
    docker cp "mts-stratos-e2e:/app/test-report.html"  $htmlOut 2>$null | Out-Null

    $color = if ($exitCode -eq 0) { 'Green' } else { 'Red' }
    Write-Host "  Completed (exit $exitCode). Results -> $jsonOut" -ForegroundColor $color

    return $exitCode
}

function Show-Comparison {
    param([string]$Label1, [string]$Label2)

    $f1 = Join-Path $outDir "test-results-$Label1.json"
    $f2 = Join-Path $outDir "test-results-$Label2.json"

    if (-not (Test-Path $f1) -or -not (Test-Path $f2)) {
        Write-Host 'One or both result files are missing — skipping comparison.' -ForegroundColor Yellow
        return
    }

    $r1 = Get-Content -Raw $f1 | ConvertFrom-Json
    $r2 = Get-Content -Raw $f2 | ConvertFrom-Json

    $skip1 = $r1.summary.totalTests - $r1.summary.passed - $r1.summary.failed
    $skip2 = $r2.summary.totalTests - $r2.summary.passed - $r2.summary.failed

    Write-Host ''
    Write-Host ('=' * 70) -ForegroundColor Magenta
    Write-Host "COMPARISON: $Label1 vs $Label2" -ForegroundColor Magenta
    Write-Host ('=' * 70) -ForegroundColor Magenta
    Write-Host ('{0,-12} {1,6} {2,6} {3,6} {4,8}' -f 'Stack', 'PASS', 'FAIL', 'SKIP', 'Pass%')
    Write-Host ('{0,-12} {1,6} {2,6} {3,6} {4,8}' -f '------', '----', '----', '----', '-----')
    Write-Host ('{0,-12} {1,6} {2,6} {3,6} {4,8}' -f $Label1.ToUpper(), $r1.summary.passed, $r1.summary.failed, $skip1, $r1.summary.passRate)
    Write-Host ('{0,-12} {1,6} {2,6} {3,6} {4,8}' -f $Label2.ToUpper(), $r2.summary.passed, $r2.summary.failed, $skip2, $r2.summary.passRate)
    Write-Host ''

    # Build per-test maps
    $map1 = @{}
    $r1.tests | ForEach-Object { $map1[$_.id] = $_ }
    $map2 = @{}
    $r2.tests | ForEach-Object { $map2[$_.id] = $_ }

    $allIds = ($r1.tests + $r2.tests) |
              Select-Object -ExpandProperty id |
              Sort-Object -Unique

    $diffs = @($allIds | Where-Object {
        $s1 = if ($map1[$_]) { $map1[$_].status } else { 'N/A' }
        $s2 = if ($map2[$_]) { $map2[$_].status } else { 'N/A' }
        $s1 -ne $s2
    })

    if ($diffs.Count -eq 0) {
        Write-Host 'All tests produced identical results on both stacks.' -ForegroundColor Green
    }
    else {
        Write-Host "Tests with different results ($($diffs.Count)):" -ForegroundColor Yellow
        Write-Host ('{0,-6} {1,-48} {2,8} {3,8}' -f 'ID', 'Description', $Label1.ToUpper(), $Label2.ToUpper())
        Write-Host ('{0,-6} {1,-48} {2,8} {3,8}' -f '--', '-----------', '------', '------')
        foreach ($id in $diffs) {
            $s1   = if ($map1[$id]) { $map1[$id].status } else { 'N/A' }
            $s2   = if ($map2[$id]) { $map2[$id].status } else { 'N/A' }
            $desc = if ($map1[$id]) { $map1[$id].description } else { $map2[$id].description }
            # Truncate description for display
            if ($desc.Length -gt 48) { $desc = $desc.Substring(0, 45) + '...' }
            $color = if     ($s1 -eq 'PASS' -and $s2 -ne 'PASS') { 'Red'    }
                     elseif ($s1 -ne 'PASS' -and $s2 -eq 'PASS') { 'Yellow' }
                     else { 'Gray' }
            Write-Host ('{0,-6} {1,-48} {2,8} {3,8}' -f $id, $desc, $s1, $s2) -ForegroundColor $color
        }
    }

    Write-Host ''
    Write-Host "Saved results: $outDir" -ForegroundColor Cyan
    Write-Host "  test-results-$Label1.json / test-results-$Label2.json"
    Write-Host "  test-report-$Label1.html  / test-report-$Label2.html"
}

# ── Main ─────────────────────────────────────────────────────────────────────

Push-Location $root
try {
    Write-Host '=== MTS-Stratos E2E Compare: Node vs Java ===' -ForegroundColor Cyan
    Write-Host "Output directory: $outDir"
    Write-Host ''

    # Ensure all required containers are running
    Write-Host 'Starting required containers (both stacks)...' -ForegroundColor Yellow
    docker compose `
        -f docker-compose.master.yml `
        -f docker-compose.java-backend.yml `
        up -d `
        postgres redis `
        bondvision-backend bondvision-backend-java `
        bondvision-digital bondvision-digital-java `
        e2e
    if ($LASTEXITCODE -ne 0) {
        throw 'Failed to start required containers.'
    }

    # Give services a moment to be ready
    Write-Host 'Waiting 3s for services to settle...' -ForegroundColor Yellow
    Start-Sleep -Seconds 3

    $script:lastRunExit = 0

    # Round 1: Node stack
    Invoke-E2ERun `
        -Label   'node' `
        -BaseUrl 'http://bondvision-digital:3001' `
        -ApiBase 'http://bondvision-backend:3000/api'
    $exitNode = $script:lastRunExit

    # Round 2: Java stack
    Invoke-E2ERun `
        -Label   'java' `
        -BaseUrl 'http://bondvision-digital-java:3002' `
        -ApiBase 'http://bondvision-backend-java:3001/api'
    $exitJava = $script:lastRunExit

    # Summary comparison
    Show-Comparison -Label1 'node' -Label2 'java'

    # Final auth cleanup
    Reset-AuthState

    Write-Host 'Done.' -ForegroundColor Green
    $finalExit = if ($exitNode -gt $exitJava) { $exitNode } else { $exitJava }
    exit $finalExit
}
finally {
    Pop-Location
}
