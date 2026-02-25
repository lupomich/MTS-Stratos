Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $repoRoot 'Testing/run-e2e-live.ps1') -NoOpenLiveBrowser
exit $LASTEXITCODE
