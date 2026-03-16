package com.mts.stratos.preferences;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mts.stratos.security.AuthenticatedUser;
import com.mts.stratos.security.SessionService;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import io.micronaut.http.exceptions.HttpStatusException;
import jakarta.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.sql.DataSource;
import java.sql.*;
import java.util.*;

/**
 * Preferences controller — maps to Node.js routes/preferences.js.
 *
 * Unauthenticated users receive default preferences (no 401).
 *
 * Routes:
 *   GET /api/preferences
 *   GET /api/preferences/ui_settings
 *   PUT /api/preferences/ui_settings
 */
@Controller("/api/preferences")
public class PreferencesController {

    private static final Logger log = LoggerFactory.getLogger(PreferencesController.class);

    private static final Map<String, Object> DEFAULT_PREFERENCES = Map.ofEntries(
            Map.entry("theme", "dark"),
            Map.entry("language", "en"),
            Map.entry("defaultColumns", List.of("description", "isin", "ccy", "bidSprd", "bidYield",
                    "bidPrice", "askPrice", "askYield", "askSprd", "midPrice", "midYield", "coupon", "maturity")),
            Map.entry("columnOrder", List.of()),
            Map.entry("lastTab", "government-bonds"),
            Map.entry("selectedCountryTab", "IT"),
            Map.entry("gridLayout", "comfortable"),
            Map.entry("rfqOpenInPopup", false),
            Map.entry("rfqOpenInTab", false),
            Map.entry("rfqAlwaysOnTop", false),
            Map.entry("rfqMaxDealers", 6),
            Map.entry("hideLegacyWorkspace", false),
            Map.entry("columnWidths", Map.of()),
            Map.entry("filters", Map.of()),
            Map.entry("sorts", List.of())
    );

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Inject SessionService sessionService;
    @Inject DataSource dataSource;

    @Get
    public HttpResponse<?> getAll(HttpRequest<?> request) {
        return getUiSettings(request);
    }

    @Get("/ui_settings")
    public HttpResponse<?> getUiSettings(HttpRequest<?> request) {
        AuthenticatedUser user;
        try {
            user = sessionService.decodeOptional(request);
        } catch (HttpStatusException e) {
            return HttpResponse.status(e.getStatus()).body(Map.of("error", e.getMessage()));
        }

        if (user == null) {
            return HttpResponse.ok(Map.of("preferences", Map.of("ui_settings", DEFAULT_PREFERENCES)));
        }

        try {
            Map<String, Object> settings = loadOrCreateDefaults(user.id());
            return HttpResponse.ok(Map.of("preferences", Map.of("ui_settings", settings)));
        } catch (Exception e) {
            log.error("GET /preferences/ui_settings error", e);
            return HttpResponse.serverError(Map.of("error", "Failed to load preferences"));
        }
    }

    @Put("/ui_settings")
    public HttpResponse<?> putUiSettings(HttpRequest<?> request, @Body Map<String, Object> body) {
        AuthenticatedUser user;
        try {
            user = sessionService.requireAuth(request);
        } catch (HttpStatusException e) {
            return HttpResponse.status(e.getStatus()).body(Map.of("error", e.getMessage()));
        }

        Map<String, Object> merged = new LinkedHashMap<>(DEFAULT_PREFERENCES);
        merged.putAll(body);

        try {
            String json = objectMapper.writeValueAsString(merged);
            try (Connection conn = dataSource.getConnection();
                 PreparedStatement ps = conn.prepareStatement(
                         "INSERT INTO user_preferences (user_id, preference_key, preference_value) " +
                         "VALUES (?::uuid, 'ui_settings', ?::jsonb) " +
                         "ON CONFLICT (user_id, preference_key) DO UPDATE SET " +
                         "preference_value = EXCLUDED.preference_value, updated_at = CURRENT_TIMESTAMP")) {
                ps.setString(1, user.id());
                ps.setString(2, json);
                ps.executeUpdate();
            }
            return HttpResponse.ok(Map.of(
                    "message", "Preferences saved successfully",
                    "preferences", Map.of("ui_settings", merged)));
        } catch (Exception e) {
            log.error("PUT /preferences/ui_settings error", e);
            return HttpResponse.serverError(Map.of("error", "Failed to save preferences"));
        }
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private Map<String, Object> loadOrCreateDefaults(String userId) throws Exception {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(
                     "SELECT preference_value FROM user_preferences " +
                     "WHERE user_id = ?::uuid AND preference_key = 'ui_settings' LIMIT 1")) {
            ps.setString(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    // Insert defaults (ON CONFLICT DO NOTHING — idempotent)
                    String defaultJson = objectMapper.writeValueAsString(DEFAULT_PREFERENCES);
                    try (PreparedStatement ins = conn.prepareStatement(
                            "INSERT INTO user_preferences (user_id, preference_key, preference_value) " +
                            "VALUES (?::uuid, 'ui_settings', ?::jsonb) " +
                            "ON CONFLICT (user_id, preference_key) DO NOTHING")) {
                        ins.setString(1, userId);
                        ins.setString(2, defaultJson);
                        ins.executeUpdate();
                    }
                    return DEFAULT_PREFERENCES;
                }

                String jsonStr = rs.getString("preference_value");
                Map<String, Object> stored = objectMapper.readValue(jsonStr,
                        new TypeReference<Map<String, Object>>() {});
                Map<String, Object> merged = new LinkedHashMap<>(DEFAULT_PREFERENCES);
                merged.putAll(stored);
                return merged;
            }
        }
    }
}
