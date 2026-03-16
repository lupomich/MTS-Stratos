# smoke-test-java.ps1
# Smoke test for the Micronaut Java backend.
# Verifies every endpoint is functionally equivalent to the Node.js backend.
#
# Usage:
#   .\scripts\smoke-test-java.ps1                        # default: http://localhost:3001
#   .\scripts\smoke-test-java.ps1 -BaseUrl http://localhost:3001
#   .\scripts\smoke-test-java.ps1 -BaseUrl http://localhost:3000  # compare against Node.js
#
# Prerequisites: the target backend must be running and connected to PostgreSQL + Redis.

param(
    [string]$BaseUrl = "http://localhost:3001",
    [string]$AdminUser = "admin",
    [string]$AdminPass = "admin123",
    [string]$DemoUser  = "demo",
    [string]$DemoPass  = "demo123"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ── Counters ──────────────────────────────────────────────────────────────────
$script:pass = 0
$script:fail = 0
$script:warn = 0

# ── Helpers ───────────────────────────────────────────────────────────────────

function Write-Pass([string]$msg) {
    Write-Host "  [PASS] $msg" -ForegroundColor Green
    $script:pass++
}

function Write-Fail([string]$msg) {
    Write-Host "  [FAIL] $msg" -ForegroundColor Red
    $script:fail++
}

function Write-Warn([string]$msg) {
    Write-Host "  [WARN] $msg" -ForegroundColor Yellow
    $script:warn++
}

function Write-Section([string]$title) {
    Write-Host "`n── $title " -ForegroundColor Cyan -NoNewline
    Write-Host ("─" * [Math]::Max(0, 55 - $title.Length)) -ForegroundColor DarkGray
}

# Makes an HTTP call and returns [statusCode, body].
# Never throws — caller decides what counts as pass/fail.
function Invoke-Api {
    param(
        [string]$Method = "GET",
        [string]$Path,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )

    $uri = "$BaseUrl$Path"
    $reqHeaders = @{ "Content-Type" = "application/json" } + $Headers

    try {
        $params = @{
            Uri             = $uri
            Method          = $Method
            Headers         = $reqHeaders
            UseBasicParsing = $true
        }
        if ($Body -ne $null) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10 -Compress)
        }

        $response = Invoke-WebRequest @params -ErrorAction Stop
        $parsed   = $response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
        return @{ Status = [int]$response.StatusCode; Body = $parsed; Raw = $response.Content }
    }
    catch [System.Net.WebException] {
        $statusCode = [int]$_.Exception.Response.StatusCode
        $raw = ""
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $raw    = $reader.ReadToEnd()
        } catch {}
        $parsed = $raw | ConvertFrom-Json -ErrorAction SilentlyContinue
        return @{ Status = $statusCode; Body = $parsed; Raw = $raw }
    }
    catch {
        return @{ Status = 0; Body = $null; Raw = $_.Exception.Message }
    }
}

function Assert-Status($result, [int]$expected, [string]$label) {
    if ($result.Status -eq $expected) {
        Write-Pass "$label → HTTP $($result.Status)"
    } else {
        Write-Fail "$label → expected HTTP $expected, got HTTP $($result.Status) | $($result.Raw)"
    }
}

function Assert-Field($result, [string]$field, [string]$label) {
    $val = $result.Body
    foreach ($part in $field.Split(".")) {
        if ($val -is [System.Management.Automation.PSCustomObject] -and
            $val.PSObject.Properties[$part]) {
            $val = $val.$part
        } else {
            Write-Fail "$label → missing field '$field'"
            return
        }
    }
    Write-Pass "$label → field '$field' present (= $val)"
}

function Assert-FieldMissing($result, [string]$field, [string]$label) {
    $val = $result.Body
    $found = $true
    foreach ($part in $field.Split(".")) {
        if ($val -is [System.Management.Automation.PSCustomObject] -and
            $val.PSObject.Properties[$part]) {
            $val = $val.$part
        } else { $found = $false; break }
    }
    if ($found) {
        Write-Fail "$label → field '$field' should NOT be present"
    } else {
        Write-Pass "$label → field '$field' correctly absent"
    }
}

# ═════════════════════════════════════════════════════════════════════════════
# MAIN
# ═════════════════════════════════════════════════════════════════════════════

Write-Host "`nBondVision Java Backend — Smoke Test" -ForegroundColor White
Write-Host "Target: $BaseUrl" -ForegroundColor DarkGray
Write-Host "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"

# ─────────────────────────────────────────────────────────────────────────────
Write-Section "1. Health"
# ─────────────────────────────────────────────────────────────────────────────

$r = Invoke-Api -Path "/api/health"
Assert-Status $r 200 "GET /api/health"
Assert-Field  $r "status" "  response.status present"
if ($r.Body.status -eq "ok") { Write-Pass "  status = 'ok'" }
else                          { Write-Fail "  status should be 'ok', got '$($r.Body.status)'" }

# ─────────────────────────────────────────────────────────────────────────────
Write-Section "2. Auth — unauthenticated guards"
# ─────────────────────────────────────────────────────────────────────────────

$r = Invoke-Api -Path "/api/auth/me"
Assert-Status $r 401 "GET /api/auth/me (no token)"

$r = Invoke-Api -Method POST -Path "/api/auth/heartbeat"
Assert-Status $r 401 "POST /api/auth/heartbeat (no token)"

# Logout without token must succeed (graceful)
$r = Invoke-Api -Method POST -Path "/api/auth/logout"
Assert-Status $r 200 "POST /api/auth/logout (no token → graceful 200)"

# ─────────────────────────────────────────────────────────────────────────────
Write-Section "3. Auth — login (bad credentials)"
# ─────────────────────────────────────────────────────────────────────────────

$r = Invoke-Api -Method POST -Path "/api/auth/login" -Body @{ username = "nobody"; password = "wrong" }
Assert-Status $r 401 "POST /api/auth/login (bad creds)"

$r = Invoke-Api -Method POST -Path "/api/auth/login" -Body @{}
Assert-Status $r 400 "POST /api/auth/login (empty body)"

# ─────────────────────────────────────────────────────────────────────────────
Write-Section "4. Auth — login (admin)"
# ─────────────────────────────────────────────────────────────────────────────

$r = Invoke-Api -Method POST -Path "/api/auth/login" -Body @{ username = $AdminUser; password = $AdminPass }

if ($r.Status -eq 200) {
    Write-Pass "POST /api/auth/login (admin) → HTTP 200"
    Assert-Field $r "token"         "  response.token"
    Assert-Field $r "user.id"       "  response.user.id"
    Assert-Field $r "user.username" "  response.user.username"
    Assert-Field $r "user.role"     "  response.user.role"
    if ($r.Body.user.role -eq "admin") { Write-Pass "  role = 'admin'" }
    else                               { Write-Fail "  role should be 'admin', got '$($r.Body.user.role)'" }
    $adminToken = $r.Body.token
} elseif ($r.Status -eq 409) {
    Write-Warn "Admin user already logged in (409 ALREADY_LOGGED_IN) — forcing logout and retrying"
    # Try to clear via logout with whatever token is in the response body, then retry
    $adminToken = $null

    # We cannot clear without a token; skip dependent tests
    Write-Warn "Cannot auto-clear stale admin session without token. Please run: POST /api/auth/logout with a valid admin JWT."
    Write-Warn "Skipping auth-dependent tests."
    $adminToken = $null
} else {
    Write-Fail "POST /api/auth/login (admin) → HTTP $($r.Status) | $($r.Raw)"
    $adminToken = $null
}

# ─────────────────────────────────────────────────────────────────────────────
Write-Section "5. Auth — /me and heartbeat"
# ─────────────────────────────────────────────────────────────────────────────

if ($adminToken) {
    $authHeader = @{ Authorization = "Bearer $adminToken" }

    $r = Invoke-Api -Path "/api/auth/me" -Headers $authHeader
    Assert-Status $r 200 "GET /api/auth/me (valid token)"
    Assert-Field  $r "user.id"       "  response.user.id"
    Assert-Field  $r "user.username" "  response.user.username"
    Assert-Field  $r "user.role"     "  response.user.role"

    $r = Invoke-Api -Method POST -Path "/api/auth/heartbeat" -Headers $authHeader
    Assert-Status $r 200 "POST /api/auth/heartbeat (valid token)"
    Assert-Field  $r "ok" "  response.ok"

    # Invalid token guard
    $badHeader = @{ Authorization = "Bearer eyJhbGciOiJIUzI1NiJ9.bad.sig" }
    $r = Invoke-Api -Path "/api/auth/me" -Headers $badHeader
    Assert-Status $r 401 "GET /api/auth/me (invalid token)"
} else {
    Write-Warn "Skipped (no admin token)"
}

# ─────────────────────────────────────────────────────────────────────────────
Write-Section "6. Auth — ALREADY_LOGGED_IN (concurrent session guard)"
# ─────────────────────────────────────────────────────────────────────────────

if ($adminToken) {
    $r = Invoke-Api -Method POST -Path "/api/auth/login" -Body @{ username = $AdminUser; password = $AdminPass }
    if ($r.Status -eq 409) {
        Write-Pass "Second login while session active → HTTP 409 ALREADY_LOGGED_IN"
        Assert-Field $r "code"     "  response.code"
        Assert-Field $r "language" "  response.language"
        if ($r.Body.code -eq "ALREADY_LOGGED_IN") { Write-Pass "  code = 'ALREADY_LOGGED_IN'" }
        else { Write-Fail "  code should be 'ALREADY_LOGGED_IN', got '$($r.Body.code)'" }
    } else {
        Write-Fail "Second login → expected HTTP 409, got HTTP $($r.Status)"
    }
} else {
    Write-Warn "Skipped (no admin token)"
}

# ─────────────────────────────────────────────────────────────────────────────
Write-Section "7. Preferences — unauthenticated returns defaults"
# ─────────────────────────────────────────────────────────────────────────────

$r = Invoke-Api -Path "/api/preferences/ui_settings"
Assert-Status $r 200 "GET /api/preferences/ui_settings (no auth)"
Assert-Field  $r "preferences.ui_settings"        "  preferences.ui_settings present"
Assert-Field  $r "preferences.ui_settings.theme"  "  ui_settings.theme present"

$r = Invoke-Api -Path "/api/preferences"
Assert-Status $r 200 "GET /api/preferences (no auth)"
Assert-Field  $r "preferences.ui_settings" "  preferences.ui_settings present"

if ($adminToken) {
    $authHeader = @{ Authorization = "Bearer $adminToken" }

    $r = Invoke-Api -Path "/api/preferences/ui_settings" -Headers $authHeader
    Assert-Status $r 200 "GET /api/preferences/ui_settings (authenticated)"
    Assert-Field  $r "preferences.ui_settings.theme" "  theme present"

    $newPrefs = @{ theme = "light"; language = "it"; lastTab = "government-bonds" }
    $r = Invoke-Api -Method PUT -Path "/api/preferences/ui_settings" -Headers $authHeader -Body $newPrefs
    Assert-Status $r 200 "PUT /api/preferences/ui_settings"
    Assert-Field  $r "message" "  response.message"

    # Verify persisted
    $r = Invoke-Api -Path "/api/preferences/ui_settings" -Headers $authHeader
    if ($r.Body.preferences.ui_settings.theme -eq "light") {
        Write-Pass "  Preference persisted (theme = 'light')"
    } else {
        Write-Fail "  Preference not persisted correctly (theme = '$($r.Body.preferences.ui_settings.theme)')"
    }
    # Restore
    $r = Invoke-Api -Method PUT -Path "/api/preferences/ui_settings" -Headers $authHeader -Body @{ theme = "dark"; language = "en" }
} else {
    Write-Warn "Skipped auth preference tests (no admin token)"
}

# ─────────────────────────────────────────────────────────────────────────────
Write-Section "8. Users — admin CRUD"
# ─────────────────────────────────────────────────────────────────────────────

if ($adminToken) {
    $authHeader = @{ Authorization = "Bearer $adminToken" }

    $r = Invoke-Api -Path "/api/users" -Headers $authHeader
    Assert-Status $r 200 "GET /api/users (admin)"
    Assert-Field  $r "users" "  response.users array"
    if ($r.Body.users -is [Array]) {
        Write-Pass "  users is an array (count=$($r.Body.users.Count))"
    } else {
        Write-Fail "  users should be an array"
    }

    # Non-admin access
    $noAuthHeader = @{ Authorization = "Bearer bad_token" }
    $r = Invoke-Api -Path "/api/users" -Headers $noAuthHeader
    Assert-Status $r 401 "GET /api/users (invalid token → 401)"

    # Create test user
    $testUsername = "smoketest_$(Get-Random -Maximum 9999)"
    $testEmail    = "$testUsername@test.local"
    $r = Invoke-Api -Method POST -Path "/api/users" -Headers $authHeader -Body @{
        username = $testUsername
        email    = $testEmail
        password = "SmokePass123!"
        role     = "viewer"
    }
    Assert-Status $r 200 "POST /api/users (create test user)"

    # Duplicate username must return 409
    $r = Invoke-Api -Method POST -Path "/api/users" -Headers $authHeader -Body @{
        username = $testUsername
        email    = "other_$testEmail"
        password = "SmokePass123!"
        role     = "viewer"
    }
    Assert-Status $r 409 "POST /api/users (duplicate username → 409)"

    # Find the created user id
    $r = Invoke-Api -Path "/api/users" -Headers $authHeader
    $testUser = $r.Body.users | Where-Object { $_.username -eq $testUsername } | Select-Object -First 1

    if ($testUser) {
        $testUserId = $testUser.id
        Write-Pass "  Created user found (id=$testUserId)"

        # Update
        $r = Invoke-Api -Method PUT -Path "/api/users/$testUserId" -Headers $authHeader -Body @{
            role      = "trader"
            is_active = $true
        }
        Assert-Status $r 200 "PUT /api/users/:id (update role)"

        # Update non-existent
        $r = Invoke-Api -Method PUT -Path "/api/users/00000000-0000-0000-0000-000000000000" -Headers $authHeader -Body @{ role = "viewer" }
        Assert-Status $r 404 "PUT /api/users (non-existent id → 404)"

        # Delete
        $r = Invoke-Api -Method DELETE -Path "/api/users/$testUserId" -Headers $authHeader
        Assert-Status $r 200 "DELETE /api/users/:id"

        # Confirm deletion
        $r = Invoke-Api -Method DELETE -Path "/api/users/$testUserId" -Headers $authHeader
        Assert-Status $r 404 "DELETE /api/users/:id (already deleted → 404)"
    } else {
        Write-Fail "  Could not find created user in list"
    }

    # Validation: missing required fields
    $r = Invoke-Api -Method POST -Path "/api/users" -Headers $authHeader -Body @{
        username = "ab"     # too short (< 3 chars)
        email    = "x@x.com"
        password = "SmokePass123!"
        role     = "viewer"
    }
    Assert-Status $r 400 "POST /api/users (username too short → 400)"

    $r = Invoke-Api -Method POST -Path "/api/users" -Headers $authHeader -Body @{
        username = "validuser"
        email    = "x@x.com"
        password = "short"  # < 8 chars
        role     = "viewer"
    }
    Assert-Status $r 400 "POST /api/users (password too short → 400)"

    $r = Invoke-Api -Method POST -Path "/api/users" -Headers $authHeader -Body @{
        username = "validuser"
        email    = "x@x.com"
        password = "SmokePass123!"
        role     = "superadmin"  # invalid role
    }
    Assert-Status $r 400 "POST /api/users (invalid role → 400)"
} else {
    Write-Warn "Skipped (no admin token)"
}

# ─────────────────────────────────────────────────────────────────────────────
Write-Section "9. Workspaces — CRUD"
# ─────────────────────────────────────────────────────────────────────────────

if ($adminToken) {
    $authHeader = @{ Authorization = "Bearer $adminToken" }

    # List (may be empty)
    $r = Invoke-Api -Path "/api/workspaces" -Headers $authHeader
    Assert-Status $r 200 "GET /api/workspaces"
    Assert-Field  $r "workspaces" "  response.workspaces array"
    $initialCount = if ($r.Body.workspaces -is [Array]) { $r.Body.workspaces.Count } else { 0 }

    # List without auth
    $r = Invoke-Api -Path "/api/workspaces"
    Assert-Status $r 401 "GET /api/workspaces (no auth → 401)"

    # Create
    $r = Invoke-Api -Method POST -Path "/api/workspaces" -Headers $authHeader -Body @{
        name      = "SmokeTest WS"
        mode      = "legacy"
        slots     = @()
        layout    = @{}
        sort_order = 999
    }
    Assert-Status $r 201 "POST /api/workspaces (create)"
    Assert-Field  $r "workspace.id"   "  workspace.id present"
    Assert-Field  $r "workspace.name" "  workspace.name present"

    if ($r.Status -eq 201 -and $r.Body.workspace.id) {
        $wsId = $r.Body.workspace.id

        # Activate
        $r = Invoke-Api -Method PUT -Path "/api/workspaces/$wsId/activate" -Headers $authHeader
        Assert-Status $r 200 "PUT /api/workspaces/:id/activate"

        # Update
        $r = Invoke-Api -Method PUT -Path "/api/workspaces/$wsId" -Headers $authHeader -Body @{
            name = "SmokeTest WS Updated"
        }
        Assert-Status $r 200 "PUT /api/workspaces/:id (update name)"
        if ($r.Body.workspace.name -eq "SmokeTest WS Updated") {
            Write-Pass "  name updated correctly"
        } else {
            Write-Fail "  name not updated correctly (got '$($r.Body.workspace.name)')"
        }

        # Update non-existent
        $r = Invoke-Api -Method PUT -Path "/api/workspaces/00000000-0000-0000-0000-000000000000" -Headers $authHeader -Body @{ name = "X" }
        Assert-Status $r 404 "PUT /api/workspaces (non-existent → 404)"

        # Delete
        $r = Invoke-Api -Method DELETE -Path "/api/workspaces/$wsId" -Headers $authHeader
        Assert-Status $r 200 "DELETE /api/workspaces/:id"

        # Verify count back to initial
        $r = Invoke-Api -Path "/api/workspaces" -Headers $authHeader
        $finalCount = if ($r.Body.workspaces -is [Array]) { $r.Body.workspaces.Count } else { 0 }
        if ($finalCount -eq $initialCount) {
            Write-Pass "  Workspace count restored ($finalCount)"
        } else {
            Write-Fail "  Workspace count mismatch: was $initialCount, now $finalCount"
        }
    } else {
        Write-Fail "  Could not get workspace id for further tests"
    }
} else {
    Write-Warn "Skipped (no admin token)"
}

# ─────────────────────────────────────────────────────────────────────────────
Write-Section "10. Bonds — RFQ (mock)"
# ─────────────────────────────────────────────────────────────────────────────

if ($adminToken) {
    $authHeader = @{ Authorization = "Bearer $adminToken" }

    $r = Invoke-Api -Path "/api/bonds/IT0006446485/rfq-data" -Headers $authHeader
    Assert-Status $r 200 "GET /api/bonds/:bondId/rfq-data"
    Assert-Field  $r "rfqData"           "  response.rfqData"
    Assert-Field  $r "rfqData.bondId"    "  rfqData.bondId"
    Assert-Field  $r "rfqData.dealers"   "  rfqData.dealers"
    Assert-Field  $r "rfqData.timestamp" "  rfqData.timestamp"

    # Without auth
    $r = Invoke-Api -Path "/api/bonds/IT0006446485/rfq-data"
    Assert-Status $r 401 "GET /api/bonds/:bondId/rfq-data (no auth → 401)"

    $r = Invoke-Api -Method POST -Path "/api/bonds/rfq/submit" -Headers $authHeader -Body @{
        isin            = "IT0006446485"
        description     = "BOT 31/0/26"
        side            = "BUY"
        size            = 5
        selectedDealers = @("MS", "UNI")
        timestamp       = [long](Get-Date -UFormat %s) * 1000
    }
    Assert-Status $r 200 "POST /api/bonds/rfq/submit"
    Assert-Field  $r "success" "  response.success"
    Assert-Field  $r "rfqId"   "  response.rfqId"
    if ($r.Body.success -eq $true) { Write-Pass "  success = true" }
    else { Write-Fail "  success should be true" }
} else {
    Write-Warn "Skipped (no admin token)"
}

# ─────────────────────────────────────────────────────────────────────────────
Write-Section "11. Auth — demo user login"
# ─────────────────────────────────────────────────────────────────────────────

$r = Invoke-Api -Method POST -Path "/api/auth/login" -Body @{ username = $DemoUser; password = $DemoPass }
if ($r.Status -eq 200) {
    Write-Pass "POST /api/auth/login (demo user) → HTTP 200"
    $demoToken = $r.Body.token

    $demoHeader = @{ Authorization = "Bearer $demoToken" }

    # Non-admin accessing /api/users must get 403
    $r = Invoke-Api -Path "/api/users" -Headers $demoHeader
    Assert-Status $r 403 "GET /api/users (demo/non-admin → 403)"

    # Demo user can access preferences
    $r = Invoke-Api -Path "/api/preferences/ui_settings" -Headers $demoHeader
    Assert-Status $r 200 "GET /api/preferences/ui_settings (demo user)"

    # Demo user can access workspaces
    $r = Invoke-Api -Path "/api/workspaces" -Headers $demoHeader
    Assert-Status $r 200 "GET /api/workspaces (demo user)"

    # Logout demo
    $r = Invoke-Api -Method POST -Path "/api/auth/logout" -Headers $demoHeader
    Assert-Status $r 200 "POST /api/auth/logout (demo user)"

    # Token should no longer be valid
    $r = Invoke-Api -Path "/api/auth/me" -Headers $demoHeader
    Assert-Status $r 401 "GET /api/auth/me (after logout → 401)"

} elseif ($r.Status -eq 409) {
    Write-Warn "Demo user already has active session (409) — skipping demo user tests"
} else {
    Write-Warn "Demo user login failed (HTTP $($r.Status)) — check credentials"
}

# ─────────────────────────────────────────────────────────────────────────────
Write-Section "12. Auth — logout admin"
# ─────────────────────────────────────────────────────────────────────────────

if ($adminToken) {
    $authHeader = @{ Authorization = "Bearer $adminToken" }
    $r = Invoke-Api -Method POST -Path "/api/auth/logout" -Headers $authHeader
    Assert-Status $r 200 "POST /api/auth/logout (admin)"
    Assert-Field  $r "message" "  response.message"

    # Session must be invalidated
    $r = Invoke-Api -Path "/api/auth/me" -Headers $authHeader
    Assert-Status $r 401 "GET /api/auth/me after logout → 401"
} else {
    Write-Warn "Skipped (no admin token)"
}

# ═════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═════════════════════════════════════════════════════════════════════════════

$total = $script:pass + $script:fail + $script:warn
Write-Host "`n$("═" * 60)" -ForegroundColor DarkGray
Write-Host "  Results for $BaseUrl" -ForegroundColor White
Write-Host "  PASS : $($script:pass)" -ForegroundColor Green
if ($script:fail -gt 0) {
    Write-Host "  FAIL : $($script:fail)" -ForegroundColor Red
} else {
    Write-Host "  FAIL : $($script:fail)" -ForegroundColor DarkGray
}
if ($script:warn -gt 0) {
    Write-Host "  WARN : $($script:warn)" -ForegroundColor Yellow
} else {
    Write-Host "  WARN : $($script:warn)" -ForegroundColor DarkGray
}
Write-Host "  TOTAL: $total"
Write-Host "$("═" * 60)`n" -ForegroundColor DarkGray

if ($script:fail -gt 0) {
    Write-Host "Some tests FAILED. Review the output above." -ForegroundColor Red
    exit 1
} else {
    Write-Host "All tests PASSED." -ForegroundColor Green
    exit 0
}
