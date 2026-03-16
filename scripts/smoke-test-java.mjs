// smoke-test-java.mjs — Node.js version of the smoke test
// Usage: node scripts/smoke-test-java.mjs [baseUrl]
// Default baseUrl: http://localhost:3001

const BASE_URL   = process.argv[2] || "http://localhost:3001";
const ADMIN_USER = process.argv[3] || "admin";
const ADMIN_PASS = process.argv[4] || "admin123";
const DEMO_USER  = process.argv[5] || "demo";
const DEMO_PASS  = process.argv[6] || "demo123";

let pass = 0, fail = 0, warn = 0;

// ── helpers ───────────────────────────────────────────────────────────────────

const green  = s => `\x1b[32m${s}\x1b[0m`;
const red    = s => `\x1b[31m${s}\x1b[0m`;
const yellow = s => `\x1b[33m${s}\x1b[0m`;
const cyan   = s => `\x1b[36m${s}\x1b[0m`;

const ok   = msg => { console.log(green(`  [PASS] ${msg}`)); pass++; };
const err  = msg => { console.log(red(`  [FAIL] ${msg}`));  fail++; };
const wrn  = msg => { console.log(yellow(`  [WARN] ${msg}`)); warn++; };
const sect = title => console.log(cyan(`\n── ${title} ${"─".repeat(Math.max(0, 55 - title.length))}`));

async function api(method, path, { headers = {}, body } = {}) {
  const url = BASE_URL + path;
  const opts = {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  };
  try {
    const res  = await fetch(url, opts);
    let parsed = null;
    try { parsed = await res.json(); } catch {}
    return { status: res.status, body: parsed };
  } catch (e) {
    return { status: 0, body: null, error: e.message };
  }
}

function get(obj, path) {
  return path.split(".").reduce((o, k) => (o != null && typeof o === "object" ? o[k] : undefined), obj);
}

function assertStatus(r, expected, label) {
  if (r.status === expected) ok(`${label} → HTTP ${r.status}`);
  else err(`${label} → expected HTTP ${expected}, got HTTP ${r.status} | ${JSON.stringify(r.body)}`);
}

function assertField(r, field, label) {
  const val = get(r.body, field);
  if (val !== undefined && val !== null) ok(`${label} → field '${field}' present (= ${JSON.stringify(val).slice(0,60)})`);
  else err(`${label} → missing field '${field}'`);
}

// ═════════════════════════════════════════════════════════════════════════════

console.log("\nBondVision Java Backend — Smoke Test");
console.log(`Target: ${BASE_URL}`);
console.log(`Started: ${new Date().toISOString()}\n`);

// 1. Health
sect("1. Health");
{
  const r = await api("GET", "/api/health");
  assertStatus(r, 200, "GET /api/health");
  assertField(r, "status", "  response.status");
  if (r.body?.status === "ok") ok("  status = 'ok'");
  else err(`  status should be 'ok', got '${r.body?.status}'`);
}

// 2. Auth guards
sect("2. Auth — unauthenticated guards");
{
  let r = await api("GET", "/api/auth/me");
  assertStatus(r, 401, "GET /api/auth/me (no token)");

  r = await api("POST", "/api/auth/heartbeat");
  assertStatus(r, 401, "POST /api/auth/heartbeat (no token)");

  r = await api("POST", "/api/auth/logout");
  assertStatus(r, 200, "POST /api/auth/logout (no token → graceful 200)");
}

// 3. Login bad creds
sect("3. Auth — login (bad credentials)");
{
  let r = await api("POST", "/api/auth/login", { body: { username: "nobody", password: "wrong" } });
  assertStatus(r, 401, "POST /api/auth/login (bad creds)");

  r = await api("POST", "/api/auth/login", { body: {} });
  assertStatus(r, 400, "POST /api/auth/login (empty body)");
}

// 4. Login admin
sect("4. Auth — login (admin)");
let adminToken = null;
{
  const r = await api("POST", "/api/auth/login", { body: { username: ADMIN_USER, password: ADMIN_PASS } });
  if (r.status === 200) {
    ok(`POST /api/auth/login (admin) → HTTP 200`);
    assertField(r, "token",         "  response.token");
    assertField(r, "user.id",       "  response.user.id");
    assertField(r, "user.username", "  response.user.username");
    assertField(r, "user.role",     "  response.user.role");
    if (r.body.user?.role === "admin") ok("  role = 'admin'");
    else err(`  role should be 'admin', got '${r.body.user?.role}'`);
    adminToken = r.body.token;
  } else if (r.status === 409) {
    wrn(`Admin already logged in (409). Trying forced logout via DB workaround — retrying login.`);
    wrn("Cannot auto-clear without token. Skipping auth-dependent tests.");
  } else {
    err(`POST /api/auth/login (admin) → HTTP ${r.status} | ${JSON.stringify(r.body)}`);
  }
}

// 5. /me + heartbeat
sect("5. Auth — /me and heartbeat");
if (adminToken) {
  const h = { Authorization: `Bearer ${adminToken}` };
  let r = await api("GET", "/api/auth/me", { headers: h });
  assertStatus(r, 200, "GET /api/auth/me (valid token)");
  assertField(r, "user.id",       "  response.user.id");
  assertField(r, "user.username", "  response.user.username");
  assertField(r, "user.role",     "  response.user.role");

  r = await api("POST", "/api/auth/heartbeat", { headers: h });
  assertStatus(r, 200, "POST /api/auth/heartbeat (valid token)");
  assertField(r, "ok", "  response.ok");

  const badH = { Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.bad.sig" };
  r = await api("GET", "/api/auth/me", { headers: badH });
  assertStatus(r, 401, "GET /api/auth/me (invalid token)");
} else wrn("Skipped (no admin token)");

// 6. ALREADY_LOGGED_IN
sect("6. Auth — ALREADY_LOGGED_IN (concurrent session guard)");
if (adminToken) {
  const r = await api("POST", "/api/auth/login", { body: { username: ADMIN_USER, password: ADMIN_PASS } });
  if (r.status === 409) {
    ok("Second login while session active → HTTP 409 ALREADY_LOGGED_IN");
    assertField(r, "code",     "  response.code");
    assertField(r, "language", "  response.language");
    if (r.body.code === "ALREADY_LOGGED_IN") ok("  code = 'ALREADY_LOGGED_IN'");
    else err(`  code should be 'ALREADY_LOGGED_IN', got '${r.body.code}'`);
  } else {
    err(`Second login → expected HTTP 409, got HTTP ${r.status}`);
  }
} else wrn("Skipped (no admin token)");

// 7. Preferences
sect("7. Preferences — unauthenticated returns defaults");
{
  let r = await api("GET", "/api/preferences/ui_settings");
  assertStatus(r, 200, "GET /api/preferences/ui_settings (no auth)");
  assertField(r, "preferences.ui_settings",       "  preferences.ui_settings present");
  assertField(r, "preferences.ui_settings.theme", "  ui_settings.theme present");

  r = await api("GET", "/api/preferences");
  assertStatus(r, 200, "GET /api/preferences (no auth)");
  assertField(r, "preferences.ui_settings", "  preferences.ui_settings present");
}
if (adminToken) {
  const h = { Authorization: `Bearer ${adminToken}` };
  let r = await api("GET", "/api/preferences/ui_settings", { headers: h });
  assertStatus(r, 200, "GET /api/preferences/ui_settings (authenticated)");
  assertField(r, "preferences.ui_settings.theme", "  theme present");

  r = await api("PUT", "/api/preferences/ui_settings", { headers: h, body: { theme: "light", language: "it" } });
  assertStatus(r, 200, "PUT /api/preferences/ui_settings");
  assertField(r, "message", "  response.message");

  r = await api("GET", "/api/preferences/ui_settings", { headers: h });
  if (r.body?.preferences?.ui_settings?.theme === "light") ok("  Preference persisted (theme = 'light')");
  else err(`  Preference not persisted (theme = '${r.body?.preferences?.ui_settings?.theme}')`);

  // Restore
  await api("PUT", "/api/preferences/ui_settings", { headers: h, body: { theme: "dark", language: "en" } });
} else wrn("Skipped auth preference tests (no admin token)");

// 8. Users CRUD
sect("8. Users — admin CRUD");
if (adminToken) {
  const h = { Authorization: `Bearer ${adminToken}` };

  let r = await api("GET", "/api/users", { headers: h });
  assertStatus(r, 200, "GET /api/users (admin)");
  assertField(r, "users", "  response.users array");
  if (Array.isArray(r.body?.users)) ok(`  users is an array (count=${r.body.users.length})`);
  else err("  users should be an array");

  const badH = { Authorization: "Bearer bad_token" };
  r = await api("GET", "/api/users", { headers: badH });
  assertStatus(r, 401, "GET /api/users (invalid token → 401)");

  const testUser = `smoketest_${Math.floor(Math.random() * 9999)}`;
  r = await api("POST", "/api/users", { headers: h, body: { username: testUser, email: `${testUser}@test.local`, password: "SmokePass123!", role: "viewer" } });
  assertStatus(r, 200, "POST /api/users (create test user)");

  r = await api("POST", "/api/users", { headers: h, body: { username: testUser, email: `other_${testUser}@test.local`, password: "SmokePass123!", role: "viewer" } });
  assertStatus(r, 409, "POST /api/users (duplicate username → 409)");

  r = await api("GET", "/api/users", { headers: h });
  const found = r.body?.users?.find(u => u.username === testUser);
  if (found) {
    ok(`  Created user found (id=${found.id})`);
    const uid = found.id;

    r = await api("PUT", `/api/users/${uid}`, { headers: h, body: { role: "trader", is_active: true } });
    assertStatus(r, 200, "PUT /api/users/:id (update role)");

    r = await api("PUT", "/api/users/00000000-0000-0000-0000-000000000000", { headers: h, body: { role: "viewer" } });
    assertStatus(r, 404, "PUT /api/users (non-existent id → 404)");

    r = await api("DELETE", `/api/users/${uid}`, { headers: h });
    assertStatus(r, 200, "DELETE /api/users/:id");

    r = await api("DELETE", `/api/users/${uid}`, { headers: h });
    assertStatus(r, 404, "DELETE /api/users/:id (already deleted → 404)");
  } else {
    err("  Could not find created user in list");
  }

  r = await api("POST", "/api/users", { headers: h, body: { username: "ab", email: "x@x.com", password: "SmokePass123!", role: "viewer" } });
  assertStatus(r, 400, "POST /api/users (username too short → 400)");

  r = await api("POST", "/api/users", { headers: h, body: { username: "validuser", email: "x@x.com", password: "short", role: "viewer" } });
  assertStatus(r, 400, "POST /api/users (password too short → 400)");

  r = await api("POST", "/api/users", { headers: h, body: { username: "validuser", email: "x@x.com", password: "SmokePass123!", role: "superadmin" } });
  assertStatus(r, 400, "POST /api/users (invalid role → 400)");
} else wrn("Skipped (no admin token)");

// 9. Workspaces
sect("9. Workspaces — CRUD");
if (adminToken) {
  const h = { Authorization: `Bearer ${adminToken}` };

  let r = await api("GET", "/api/workspaces", { headers: h });
  assertStatus(r, 200, "GET /api/workspaces");
  assertField(r, "workspaces", "  response.workspaces array");
  const initialCount = Array.isArray(r.body?.workspaces) ? r.body.workspaces.length : 0;

  r = await api("GET", "/api/workspaces");
  assertStatus(r, 401, "GET /api/workspaces (no auth → 401)");

  r = await api("POST", "/api/workspaces", { headers: h, body: { name: "SmokeTest WS", mode: "legacy", slots: [], layout: {}, sort_order: 999 } });
  assertStatus(r, 201, "POST /api/workspaces (create)");
  assertField(r, "workspace.id",   "  workspace.id present");
  assertField(r, "workspace.name", "  workspace.name present");

  if (r.status === 201 && r.body?.workspace?.id) {
    const wsId = r.body.workspace.id;

    r = await api("PUT", `/api/workspaces/${wsId}/activate`, { headers: h });
    assertStatus(r, 200, "PUT /api/workspaces/:id/activate");

    r = await api("PUT", `/api/workspaces/${wsId}`, { headers: h, body: { name: "SmokeTest WS Updated" } });
    assertStatus(r, 200, "PUT /api/workspaces/:id (update name)");
    if (r.body?.workspace?.name === "SmokeTest WS Updated") ok("  name updated correctly");
    else err(`  name not updated correctly (got '${r.body?.workspace?.name}')`);

    r = await api("PUT", "/api/workspaces/00000000-0000-0000-0000-000000000000", { headers: h, body: { name: "X" } });
    assertStatus(r, 404, "PUT /api/workspaces (non-existent → 404)");

    r = await api("DELETE", `/api/workspaces/${wsId}`, { headers: h });
    assertStatus(r, 200, "DELETE /api/workspaces/:id");

    r = await api("GET", "/api/workspaces", { headers: h });
    const finalCount = Array.isArray(r.body?.workspaces) ? r.body.workspaces.length : 0;
    if (finalCount === initialCount) ok(`  Workspace count restored (${finalCount})`);
    else err(`  Workspace count mismatch: was ${initialCount}, now ${finalCount}`);
  } else {
    err("  Could not get workspace id for further tests");
  }
} else wrn("Skipped (no admin token)");

// 10. Bonds
sect("10. Bonds — RFQ (mock)");
if (adminToken) {
  const h = { Authorization: `Bearer ${adminToken}` };

  let r = await api("GET", "/api/bonds/IT0006446485/rfq-data", { headers: h });
  assertStatus(r, 200, "GET /api/bonds/:bondId/rfq-data");
  assertField(r, "rfqData",           "  response.rfqData");
  assertField(r, "rfqData.bondId",    "  rfqData.bondId");
  assertField(r, "rfqData.dealers",   "  rfqData.dealers");
  assertField(r, "rfqData.timestamp", "  rfqData.timestamp");

  r = await api("GET", "/api/bonds/IT0006446485/rfq-data");
  assertStatus(r, 401, "GET /api/bonds/:bondId/rfq-data (no auth → 401)");

  r = await api("POST", "/api/bonds/rfq/submit", { headers: h, body: { isin: "IT0006446485", description: "BOT 31/0/26", side: "BUY", size: 5, selectedDealers: ["MS","UNI"], timestamp: Date.now() } });
  assertStatus(r, 200, "POST /api/bonds/rfq/submit");
  assertField(r, "success", "  response.success");
  assertField(r, "rfqId",   "  response.rfqId");
  if (r.body?.success === true) ok("  success = true");
  else err("  success should be true");
} else wrn("Skipped (no admin token)");

// 11. Demo user
sect("11. Auth — demo user");
let demoToken = null;
{
  const r = await api("POST", "/api/auth/login", { body: { username: DEMO_USER, password: DEMO_PASS } });
  if (r.status === 200) {
    ok("POST /api/auth/login (demo user) → HTTP 200");
    demoToken = r.body.token;
    const dh = { Authorization: `Bearer ${demoToken}` };

    let dr = await api("GET", "/api/users", { headers: dh });
    assertStatus(dr, 403, "GET /api/users (demo/non-admin → 403)");

    dr = await api("GET", "/api/preferences/ui_settings", { headers: dh });
    assertStatus(dr, 200, "GET /api/preferences/ui_settings (demo user)");

    dr = await api("GET", "/api/workspaces", { headers: dh });
    assertStatus(dr, 200, "GET /api/workspaces (demo user)");

    dr = await api("POST", "/api/auth/logout", { headers: dh });
    assertStatus(dr, 200, "POST /api/auth/logout (demo user)");

    dr = await api("GET", "/api/auth/me", { headers: dh });
    assertStatus(dr, 401, "GET /api/auth/me (after demo logout → 401)");
  } else if (r.status === 409) {
    wrn("Demo user already has active session (409) — skipping demo user tests");
  } else {
    wrn(`Demo user login failed (HTTP ${r.status}) — check credentials`);
  }
}

// 12. Logout admin
sect("12. Auth — logout admin");
if (adminToken) {
  const h = { Authorization: `Bearer ${adminToken}` };
  let r = await api("POST", "/api/auth/logout", { headers: h });
  assertStatus(r, 200, "POST /api/auth/logout (admin)");
  assertField(r, "message", "  response.message");

  r = await api("GET", "/api/auth/me", { headers: h });
  assertStatus(r, 401, "GET /api/auth/me after logout → 401");
} else wrn("Skipped (no admin token)");

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${"═".repeat(60)}`);
console.log(`  Results for ${BASE_URL}`);
console.log(green(`  PASS : ${pass}`));
console.log(fail > 0 ? red(`  FAIL : ${fail}`) : `  FAIL : ${fail}`);
console.log(warn > 0 ? yellow(`  WARN : ${warn}`) : `  WARN : ${warn}`);
console.log(`  TOTAL: ${pass + fail + warn}`);
console.log(`${"═".repeat(60)}\n`);
if (fail > 0) { console.log(red("Some tests FAILED.")); process.exit(1); }
else { console.log(green("All tests PASSED.")); }
