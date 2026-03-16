package com.mts.stratos.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.lettuce.core.api.StatefulRedisConnection;
import io.micronaut.context.annotation.Value;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.exceptions.HttpStatusException;
import jakarta.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.sql.DataSource;
import java.sql.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Session validation service — mirrors Node.js requireAuth / requireAdmin middleware exactly.
 *
 * Session state is stored in:
 *   - PostgreSQL: users.is_logged_in, active_session_id, active_session_at
 *   - Redis: auth:online:{userId}  (TTL = SESSION_ONLINE_TTL_SECONDS)
 */
@Singleton
public class SessionService {

    private static final Logger log = LoggerFactory.getLogger(SessionService.class);

    private final JwtService jwtService;
    private final DataSource dataSource;
    private final StatefulRedisConnection<String, String> redis;
    private final long sessionIdleTimeoutSeconds;
    private final long sessionOnlineTtlSeconds;

    public SessionService(
            JwtService jwtService,
            DataSource dataSource,
            StatefulRedisConnection<String, String> redis,
            @Value("${app.session-idle-timeout-seconds:300}") long sessionIdleTimeoutSeconds,
            @Value("${app.session-online-ttl-seconds:315}") long sessionOnlineTtlSeconds) {
        this.jwtService = jwtService;
        this.dataSource = dataSource;
        this.redis = redis;
        this.sessionIdleTimeoutSeconds = sessionIdleTimeoutSeconds;
        this.sessionOnlineTtlSeconds = sessionOnlineTtlSeconds;
    }

    // ── Public helpers ────────────────────────────────────────────────────────

    /** Validates token + session state. Throws 401 if invalid. */
    public AuthenticatedUser requireAuth(HttpRequest<?> request) {
        return validateSession(request, false);
    }

    /** Validates token + session state + admin role. Throws 401/403 if invalid. */
    public AuthenticatedUser requireAdmin(HttpRequest<?> request) {
        AuthenticatedUser user = validateSession(request, false);
        if (!user.isAdmin()) {
            throw new HttpStatusException(HttpStatus.FORBIDDEN, "Forbidden");
        }
        return user;
    }

    /**
     * Attempts to decode token without DB validation (used where unauthenticated
     * access returns defaults rather than 401, e.g. preferences).
     * Returns null if token is missing or invalid.
     */
    public AuthenticatedUser decodeOptional(HttpRequest<?> request) {
        String authHeader = request.getHeaders().getFirst("Authorization").orElse(null);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        try {
            return validateSession(request, false);
        } catch (HttpStatusException e) {
            return null;
        }
    }

    // ── Redis helpers ─────────────────────────────────────────────────────────

    public void syncOnlineCache(String userId, String sessionId) {
        try {
            redis.sync().setex(onlineKey(userId), sessionOnlineTtlSeconds, sessionId);
        } catch (Exception e) {
            log.error("Redis write error (syncOnlineCache): {}", e.getMessage());
        }
    }

    public void clearOnlineCache(String userId) {
        try {
            redis.sync().del(onlineKey(userId));
        } catch (Exception e) {
            log.error("Redis write error (clearOnlineCache): {}", e.getMessage());
        }
    }

    public String getCachedSessionId(String userId) {
        try {
            return redis.sync().get(onlineKey(userId));
        } catch (Exception e) {
            log.error("Redis read error: {}", e.getMessage());
            return null;
        }
    }

    // ── DB helpers ────────────────────────────────────────────────────────────

    public void clearUserSessionState(String userId) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(
                     "UPDATE users SET is_logged_in = false, active_session_id = NULL, active_session_at = NULL WHERE id = ?")) {
            ps.setObject(1, UUID.fromString(userId));
            ps.executeUpdate();
        } catch (Exception e) {
            log.error("DB error (clearUserSessionState): {}", e.getMessage());
        }
        clearOnlineCache(userId);
    }

    public void touchSessionAt(String userId) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(
                     "UPDATE users SET active_session_at = CURRENT_TIMESTAMP WHERE id = ?")) {
            ps.setObject(1, UUID.fromString(userId));
            ps.executeUpdate();
        } catch (Exception e) {
            log.error("DB error (touchSessionAt): {}", e.getMessage());
        }
    }

    public boolean isSessionStale(Timestamp activeSessionAt) {
        if (activeSessionAt == null) return true;
        long ageSeconds = Instant.now().getEpochSecond() - activeSessionAt.toInstant().getEpochSecond();
        return ageSeconds > sessionIdleTimeoutSeconds;
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private AuthenticatedUser validateSession(HttpRequest<?> request, boolean adminRequired) {
        String authHeader = request.getHeaders().getFirst("Authorization").orElse(null);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new HttpStatusException(HttpStatus.UNAUTHORIZED, "No token provided");
        }
        String token = authHeader.substring(7);

        Claims claims;
        try {
            claims = jwtService.parseToken(token);
        } catch (JwtException e) {
            throw new HttpStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }

        String userId   = claims.get("id", String.class);
        String username = claims.get("username", String.class);
        String role     = claims.get("role", String.class);
        String sessionId = claims.get("sessionId", String.class);

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(
                     "SELECT id, username, role, is_logged_in, active_session_id, active_session_at " +
                     "FROM users WHERE id = ? AND is_active = true LIMIT 1")) {
            ps.setObject(1, UUID.fromString(userId));
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    throw new HttpStatusException(HttpStatus.UNAUTHORIZED, "Invalid token user");
                }

                boolean isLoggedIn  = rs.getBoolean("is_logged_in");
                String  dbSessionId = rs.getString("active_session_id");
                Timestamp sessionAt = rs.getTimestamp("active_session_at");

                // Stale check
                if (isSessionStale(sessionAt)) {
                    clearUserSessionState(userId);
                    throw new HttpStatusException(HttpStatus.UNAUTHORIZED, "Session expired");
                }

                // Session ID mismatch
                if (!isLoggedIn || dbSessionId == null || !dbSessionId.equals(sessionId)) {
                    throw new HttpStatusException(HttpStatus.UNAUTHORIZED, "Session expired");
                }

                // Redis consistency
                try {
                    String cachedSessionId = redis.sync().get(onlineKey(userId));
                    if (cachedSessionId == null) {
                        syncOnlineCache(userId, dbSessionId);
                    } else if (!cachedSessionId.equals(dbSessionId)) {
                        throw new HttpStatusException(HttpStatus.UNAUTHORIZED, "Session expired");
                    }
                } catch (HttpStatusException e) {
                    throw e;
                } catch (Exception e) {
                    log.error("Redis read error on session validation: {}", e.getMessage());
                }
            }
        } catch (HttpStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("DB error during session validation: {}", e.getMessage());
            throw new HttpStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Server error");
        }

        return new AuthenticatedUser(userId, username, role, sessionId);
    }

    private static String onlineKey(String userId) {
        return "auth:online:" + userId;
    }
}
