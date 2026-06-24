import { execFileSync } from 'node:child_process';

/**
 * Playwright global setup.
 *
 * Resets the auth/session state in PostgreSQL and Redis so the live E2E suite
 * is deterministic when launched directly from the VS Code Test Explorer
 * (i.e. without going through run-live.ps1 / run-e2e-live.ps1).
 *
 * Mirrors the reset performed by Testing/run-e2e-live.ps1. Failures are logged
 * as warnings and do not abort the run, so the suite still works in environments
 * where Docker/containers are not reachable.
 */

const POSTGRES_CONTAINER = process.env.E2E_POSTGRES_CONTAINER || 'mts-stratos-postgres';
const REDIS_CONTAINER = process.env.E2E_REDIS_CONTAINER || 'mts-stratos-redis';
const PG_USER = process.env.E2E_PG_USER || 'stratos';
const PG_DB = process.env.E2E_PG_DB || 'stratos_db';

function runDocker(args, label) {
    try {
        execFileSync('docker', args, { stdio: 'pipe' });
        return true;
    } catch (error) {
        const stderr = error?.stderr?.toString?.().trim();
        const message = stderr || error?.message || 'unknown error';
        console.warn(`[global-setup] ${label} warning: ${message}`);
        return false;
    }
}

function psql(sql, label) {
    return runDocker(
        ['exec', POSTGRES_CONTAINER, 'psql', '-U', PG_USER, '-d', PG_DB, '-c', sql],
        label
    );
}

export default function globalSetup() {
    resetAuthState();
}

export function resetAuthState() {
    if (process.env.E2E_SKIP_RESET === 'true') {
        console.log('[global-setup] E2E_SKIP_RESET=true -> skipping auth/session reset.');
        return;
    }

    console.log('[global-setup] Resetting auth/session state for deterministic live run...');

    psql(
        'UPDATE users SET is_logged_in = false, active_session_id = NULL, active_session_at = NULL;',
        'users session flags reset'
    );
    psql(
        'UPDATE user_sessions SET is_active = false WHERE is_active = true;',
        'user_sessions deactivate'
    );
    psql(
        "DELETE FROM users WHERE username IN ('admin-test','trader-test','viewer-test','trader-final','viewer-final');",
        'residual test users delete'
    );
    runDocker(
        ['exec', REDIS_CONTAINER, 'sh', '-lc', "redis-cli --scan --pattern 'auth:online:*' | xargs -r redis-cli del >/dev/null"],
        'redis auth keys reset'
    );

    console.log('[global-setup] Auth/session reset complete.');
}
