# build-and-deploy.ps1
# Builds the Java backend fat JAR on the host (where VPN routes correctly),
# then rebuilds the Docker image and restarts the Java backend container.
#
# Usage:
#   .\build-and-deploy.ps1                      # Java backend only
#   .\build-and-deploy.ps1 -WithNodeBackend     # both Java + Node.js

param(
    [switch]$WithNodeBackend
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$JavaProjectDir = Join-Path $ProjectRoot "bondvision-backend-java"

# ── Find Java 21 ──────────────────────────────────────────────────────────────
if (-not $env:JAVA_HOME) {
    $javaPath = Get-Command java -ErrorAction SilentlyContinue
    if ($javaPath) {
        $env:JAVA_HOME = Split-Path -Parent (Split-Path -Parent $javaPath.Source)
    } else {
        # Try known location used during initial setup
        $candidate = "C:\Users\$env:USERNAME\AppData\Local\Java\jdk-21.0.9"
        if (Test-Path $candidate) { $env:JAVA_HOME = $candidate }
        else { throw "Java 21 not found. Set JAVA_HOME or install Java 21." }
    }
}
Write-Host "[1/4] JAVA_HOME = $env:JAVA_HOME" -ForegroundColor Cyan

# ── Find Gradle 8.8 ───────────────────────────────────────────────────────────
$gradleBat = $null
$gradleCandidates = @(
    "$env:USERPROFILE\AppData\Local\gradle-8.8\bin\gradle.bat",
    "C:\gradle\gradle-8.8\bin\gradle.bat",
    "C:\tools\gradle-8.8\bin\gradle.bat"
)
foreach ($c in $gradleCandidates) {
    if (Test-Path $c) { $gradleBat = $c; break }
}
if (-not $gradleBat) {
    # Fall back to whatever gradle is on PATH
    $g = Get-Command gradle -ErrorAction SilentlyContinue
    if ($g) { $gradleBat = $g.Source }
    else { throw "Gradle 8.8 not found. Download from https://gradle.org/releases/ and extract to $gradleCandidates[0]" }
}
Write-Host "[1/4] Gradle   = $gradleBat" -ForegroundColor Cyan

# ── Build fat JAR ─────────────────────────────────────────────────────────────
Write-Host "`n[2/4] Building fat JAR..." -ForegroundColor Yellow
Push-Location $JavaProjectDir
try {
    & $gradleBat shadowJar --no-daemon
    if ($LASTEXITCODE -ne 0) { throw "Gradle build failed (exit $LASTEXITCODE)" }
} finally {
    Pop-Location
}

$jar = Get-ChildItem "$JavaProjectDir\build\libs\*-all.jar" -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $jar) { throw "Fat JAR not found in $JavaProjectDir\build\libs\" }
Write-Host "     JAR: $($jar.Name) ($([math]::Round($jar.Length/1MB, 1)) MB)" -ForegroundColor Green

# ── Build Docker image ────────────────────────────────────────────────────────
Write-Host "`n[3/4] Building Docker image..." -ForegroundColor Yellow
Push-Location $JavaProjectDir
try {
    docker build -t mts-stratos-backend-java .
    if ($LASTEXITCODE -ne 0) { throw "docker build failed" }
} finally {
    Pop-Location
}

# ── Start / restart containers ────────────────────────────────────────────────
Write-Host "`n[4/4] Starting containers..." -ForegroundColor Yellow
Push-Location $ProjectRoot
try {
    if ($WithNodeBackend) {
        docker-compose -f docker-compose.master.yml -f docker-compose.java-backend.yml up --build -d
    } else {
        docker-compose -f docker-compose.master.yml -f docker-compose.java-backend.yml up --build -d bondvision-backend-java
    }
    if ($LASTEXITCODE -ne 0) { throw "docker-compose failed" }
} finally {
    Pop-Location
}

Start-Sleep -Seconds 3

Write-Host "`n[done] Container status:" -ForegroundColor Green
docker ps --filter "name=mts-stratos-backend-java" --format "table {{.Names}}`t{{.Status}}"
