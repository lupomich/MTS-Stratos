package com.mts.stratos.auth;

import at.favre.lib.crypto.bcrypt.BCrypt;
import com.mts.stratos.auth.dto.LoginRequest;
import com.mts.stratos.security.JwtService;
import com.mts.stratos.security.SessionService;
import io.lettuce.core.api.StatefulRedisConnection;
import io.micronaut.context.annotation.Value;
import jakarta.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.sql.DataSource;
import java.sql.*;
import java.util.*;

/**
 * Auth business logic — ports Node.js routes/auth.js exactly.
 *
 * Session state machine:
 *   Redis session + DB logged_in + NOT stale  → 409 ALREADY_LOGGED_IN
 *   No Redis     + DB logged_in + NOT stale   → sync Redis → 409 ALREADY_LOGGED_IN
 *   Any          + DB logged_in +     stale   → clear state → proceed
 *   Redis stale  + DB NOT logged_in           → clear Redis → proceed
 *   Normal path                               → create session, issue JWT
 */
@Singleton
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final DataSource dataSource;
    private final JwtService jwtService;
    private final SessionService sessionService;
    private final StatefulRedisConnection<String, String> redis;
    private final long sessionIdleTimeoutSeconds;

    public AuthService(DataSource dataSource,
                       JwtService jwtService,
                       SessionService sessionService,
                       StatefulRedisConnection<String, String> redis,
                       @Value("${app.session-idle-timeout-seconds:300}") long sessionIdleTimeoutSeconds) {
        this.dataSource = dataSource;
        this.jwtService = jwtService;
        this.sessionService = sessionService;
        this.redis = redis;
        this.sessionIdleTimeoutSeconds = sessionIdleTimeoutSeconds;
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    public Map<String, Object> login(LoginRequest req) throws Exception {
        if (req.getUsername() == null || req.getPassword() == null) {
            throw new InvalidInputException("Invalid input");
        }

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(
                     "SELECT id, username, email, role, password_hash, is_logged_in, " +
                     "active_session_id, active_session_at FROM users " +
                     "WHERE username = ? AND is_active = true LIMIT 1")) {
            ps.setString(1, req.getUsername());
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    throw new InvalidCredentialsException("Invalid credentials");
                }

                String userId       = rs.getString("id");
                String username     = rs.getString("username");
                String email        = rs.getString("email");
                String role         = rs.getString("role");
                String passwordHash = rs.getString("password_hash");
                boolean isLoggedIn  = rs.getBoolean("is_logged_in");
                String dbSessionId  = rs.getString("active_session_id");
                Timestamp sessionAt = rs.getTimestamp("active_session_at");

                // Verify password
                BCrypt.Result result = BCrypt.verifyer().verify(
                        req.getPassword().toCharArray(), passwordHash);
                if (!result.verified) {
                    throw new InvalidCredentialsException("Invalid credentials");
                }

                // --- Session conflict detection ---
                String cachedSessionId = sessionService.getCachedSessionId(userId);

                if (cachedSessionId != null && isLoggedIn) {
                    if (sessionService.isSessionStale(sessionAt)) {
                        sessionService.clearUserSessionState(userId);
                        isLoggedIn = false; dbSessionId = null;
                        cachedSessionId = null;
                    } else {
                        String lang = getUserLanguage(conn, userId);
                        throw new AlreadyLoggedInException(alreadyLoggedMsg(lang), lang);
                    }
                }

                if (cachedSessionId == null && isLoggedIn) {
                    if (sessionService.isSessionStale(sessionAt)) {
                        sessionService.clearUserSessionState(userId);
                        isLoggedIn = false; dbSessionId = null;
                    } else {
                        sessionService.syncOnlineCache(userId, dbSessionId != null ? dbSessionId : UUID.randomUUID().toString());
                        String lang = getUserLanguage(conn, userId);
                        throw new AlreadyLoggedInException(alreadyLoggedMsg(lang), lang);
                    }
                }

                if (cachedSessionId != null && !isLoggedIn) {
                    sessionService.clearOnlineCache(userId);
                }

                // --- Create new session ---
                String newSessionId = UUID.randomUUID().toString();

                try (PreparedStatement upd = conn.prepareStatement(
                        "UPDATE users SET last_login = CURRENT_TIMESTAMP, is_logged_in = true, " +
                        "active_session_id = ?, active_session_at = CURRENT_TIMESTAMP WHERE id = ?")) {
                    upd.setObject(1, UUID.fromString(newSessionId));
                    upd.setObject(2, UUID.fromString(userId));
                    upd.executeUpdate();
                }

                sessionService.syncOnlineCache(userId, newSessionId);

                String token = jwtService.createToken(userId, username, role, newSessionId);
                return Map.of(
                        "token", token,
                        "user", Map.of("id", userId, "username", username, "email", email, "role", role));
            }
        }
    }

    // ── Logout ────────────────────────────────────────────────────────────────

    public void logout(String userId) {
        sessionService.clearUserSessionState(userId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String getUserLanguage(Connection conn, String userId) {
        try (PreparedStatement ps = conn.prepareStatement(
                "SELECT preference_value->>'language' AS language FROM user_preferences " +
                "WHERE user_id = ? AND preference_key = 'ui_settings' LIMIT 1")) {
            ps.setObject(1, UUID.fromString(userId));
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    String lang = rs.getString("language");
                    return "it".equals(lang) ? "it" : "en";
                }
            }
        } catch (Exception e) {
            log.warn("Could not fetch user language: {}", e.getMessage());
        }
        return "en";
    }

    private static String alreadyLoggedMsg(String lang) {
        return "it".equals(lang)
                ? "Utente già collegato da un'altra sessione"
                : "User already logged in from another session";
    }

    // ── Inner exception types ─────────────────────────────────────────────────

    public static class InvalidInputException extends RuntimeException {
        public InvalidInputException(String msg) { super(msg); }
    }

    public static class InvalidCredentialsException extends RuntimeException {
        public InvalidCredentialsException(String msg) { super(msg); }
    }

    public static class AlreadyLoggedInException extends RuntimeException {
        private final String language;
        public AlreadyLoggedInException(String msg, String language) {
            super(msg);
            this.language = language;
        }
        public String getLanguage() { return language; }
    }
}
