package com.mts.stratos.workspaces;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mts.stratos.security.AuthenticatedUser;
import com.mts.stratos.security.SessionService;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.annotation.*;
import io.micronaut.http.exceptions.HttpStatusException;
import jakarta.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.sql.DataSource;
import java.sql.*;
import java.util.*;

/**
 * Workspaces controller — maps to Node.js routes/workspaces.js.
 *
 * Routes:
 *   GET    /api/workspaces
 *   POST   /api/workspaces
 *   PUT    /api/workspaces/:id/activate
 *   PUT    /api/workspaces/:id
 *   DELETE /api/workspaces/:id
 */
@Controller("/api/workspaces")
public class WorkspacesController {

    private static final Logger log = LoggerFactory.getLogger(WorkspacesController.class);

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Inject SessionService sessionService;
    @Inject DataSource dataSource;

    @Get
    public HttpResponse<?> list(HttpRequest<?> request) {
        AuthenticatedUser user;
        try { user = sessionService.requireAuth(request); }
        catch (HttpStatusException e) { return HttpResponse.status(e.getStatus()).body(Map.of("error", e.getMessage())); }

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(
                     "SELECT * FROM user_workspaces WHERE user_id = ?::uuid " +
                     "ORDER BY sort_order ASC, created_at ASC")) {
            ps.setString(1, user.id());
            try (ResultSet rs = ps.executeQuery()) {
                List<Map<String, Object>> workspaces = new ArrayList<>();
                while (rs.next()) workspaces.add(normalizeWorkspace(rs));
                return HttpResponse.ok(Map.of("workspaces", workspaces));
            }
        } catch (Exception e) {
            log.error("GET /workspaces error", e);
            return HttpResponse.serverError(Map.of("error", "Failed to load workspaces"));
        }
    }

    @Post
    public HttpResponse<?> create(HttpRequest<?> request, @Body Map<String, Object> body) {
        AuthenticatedUser user;
        try { user = sessionService.requireAuth(request); }
        catch (HttpStatusException e) { return HttpResponse.status(e.getStatus()).body(Map.of("error", e.getMessage())); }

        try {
            String slotsJson      = jsonOrDefault(body.get("slots"), "[]");
            String layoutJson     = jsonOrDefault(body.get("layout"), "{}");
            String hiddenJson     = jsonOrDefault(firstNonNull(body.get("hidden_slots"), body.get("hiddenSlots")), "[]");
            int sortOrder         = toInt(firstNonNull(body.get("sort_order"), body.get("sortOrder")), 0);
            String name           = str(body.get("name"), "Workspace");
            String mode           = str(body.get("mode"), "legacy");

            try (Connection conn = dataSource.getConnection();
                 PreparedStatement ps = conn.prepareStatement(
                         "INSERT INTO user_workspaces (user_id, name, mode, slots, layout, hidden_slots, sort_order) " +
                         "VALUES (?::uuid, ?, ?, ?::jsonb, ?::jsonb, ?::jsonb, ?) RETURNING *")) {
                ps.setString(1, user.id());
                ps.setString(2, name);
                ps.setString(3, mode);
                ps.setString(4, slotsJson);
                ps.setString(5, layoutJson);
                ps.setString(6, hiddenJson);
                ps.setInt(7, sortOrder);
                try (ResultSet rs = ps.executeQuery()) {
                    rs.next();
                    return HttpResponse.status(HttpStatus.CREATED)
                            .body(Map.of("workspace", normalizeWorkspace(rs)));
                }
            }
        } catch (Exception e) {
            log.error("POST /workspaces error", e);
            return HttpResponse.serverError(Map.of("error", "Failed to create workspace"));
        }
    }

    @Put("/{id}/activate")
    public HttpResponse<?> activate(HttpRequest<?> request, String id) {
        AuthenticatedUser user;
        try { user = sessionService.requireAuth(request); }
        catch (HttpStatusException e) { return HttpResponse.status(e.getStatus()).body(Map.of("error", e.getMessage())); }

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(
                     "UPDATE user_workspaces SET last_active_at = CURRENT_TIMESTAMP, " +
                     "updated_at = CURRENT_TIMESTAMP WHERE user_id = ?::uuid AND id = ?::uuid")) {
            ps.setString(1, user.id());
            ps.setString(2, id);
            ps.executeUpdate();
            return HttpResponse.ok(Map.of("message", "Workspace activated"));
        } catch (Exception e) {
            log.error("PUT /workspaces/{}/activate error", id, e);
            return HttpResponse.serverError(Map.of("error", "Failed to activate workspace"));
        }
    }

    @Put("/{id}")
    public HttpResponse<?> update(HttpRequest<?> request, String id, @Body Map<String, Object> body) {
        AuthenticatedUser user;
        try { user = sessionService.requireAuth(request); }
        catch (HttpStatusException e) { return HttpResponse.status(e.getStatus()).body(Map.of("error", e.getMessage())); }

        List<String> setClauses = new ArrayList<>();
        List<Object[]> params   = new ArrayList<>(); // {value, sqlType, cast}

        if (body.containsKey("name"))         { setClauses.add("name = ?");         params.add(new Object[]{str(body.get("name"), ""), Types.VARCHAR, ""}); }
        if (body.containsKey("mode"))         { setClauses.add("mode = ?");         params.add(new Object[]{str(body.get("mode"), "legacy"), Types.VARCHAR, ""}); }
        if (body.containsKey("slots"))        { setClauses.add("slots = ?::jsonb"); params.add(new Object[]{jsonOrDefault(body.get("slots"), "[]"), Types.VARCHAR, "::jsonb"}); }
        if (body.containsKey("layout"))       { setClauses.add("layout = ?::jsonb"); params.add(new Object[]{jsonOrDefault(body.get("layout"), "{}"), Types.VARCHAR, ""}); }
        Object hiddenVal = firstNonNull(body.get("hidden_slots"), body.get("hiddenSlots"));
        if (hiddenVal != null)                { setClauses.add("hidden_slots = ?::jsonb"); params.add(new Object[]{jsonOrDefault(hiddenVal, "[]"), Types.VARCHAR, ""}); }
        Object sortVal = firstNonNull(body.get("sort_order"), body.get("sortOrder"));
        if (sortVal != null)                  { setClauses.add("sort_order = ?");   params.add(new Object[]{toInt(sortVal, 0), Types.INTEGER, ""}); }

        if (setClauses.isEmpty()) return HttpResponse.ok(Map.of("message", "Nothing to update"));

        setClauses.add("updated_at = CURRENT_TIMESTAMP");
        String sql = "UPDATE user_workspaces SET " + String.join(", ", setClauses) +
                     " WHERE user_id = ?::uuid AND id = ?::uuid RETURNING *";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            int i = 1;
            for (Object[] p : params) {
                ps.setObject(i++, p[0]);
            }
            ps.setString(i++, user.id());
            ps.setString(i, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) return HttpResponse.notFound(Map.of("error", "Workspace not found"));
                return HttpResponse.ok(Map.of("workspace", normalizeWorkspace(rs)));
            }
        } catch (Exception e) {
            log.error("PUT /workspaces/{} error", id, e);
            return HttpResponse.serverError(Map.of("error", "Failed to update workspace"));
        }
    }

    @Delete("/{id}")
    public HttpResponse<?> delete(HttpRequest<?> request, String id) {
        AuthenticatedUser user;
        try { user = sessionService.requireAuth(request); }
        catch (HttpStatusException e) { return HttpResponse.status(e.getStatus()).body(Map.of("error", e.getMessage())); }

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(
                     "DELETE FROM user_workspaces WHERE user_id = ?::uuid AND id = ?::uuid")) {
            ps.setString(1, user.id());
            ps.setString(2, id);
            ps.executeUpdate();
            return HttpResponse.ok(Map.of("message", "Workspace deleted"));
        } catch (Exception e) {
            log.error("DELETE /workspaces/{} error", id, e);
            return HttpResponse.serverError(Map.of("error", "Failed to delete workspace"));
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Map<String, Object> normalizeWorkspace(ResultSet rs) throws Exception {
        Map<String, Object> w = new LinkedHashMap<>();
        w.put("id",           rs.getString("id"));
        w.put("name",         rs.getString("name"));
        w.put("mode",         rs.getString("mode"));
        w.put("slots",        parseJson(rs.getString("slots"), List.class));
        w.put("layout",       parseJson(rs.getString("layout"), Map.class));
        w.put("hiddenSlots",  parseJson(rs.getString("hidden_slots"), List.class));
        w.put("sortOrder",    rs.getInt("sort_order"));
        w.put("lastActiveAt", rs.getTimestamp("last_active_at"));
        w.put("createdAt",    rs.getTimestamp("created_at"));
        w.put("updatedAt",    rs.getTimestamp("updated_at"));
        return w;
    }

    private <T> T parseJson(String json, Class<T> type) {
        if (json == null) return null;
        try { return objectMapper.readValue(json, type); }
        catch (Exception e) { return null; }
    }

    private String jsonOrDefault(Object val, String def) {
        if (val == null) return def;
        try { return objectMapper.writeValueAsString(val); }
        catch (Exception e) { return def; }
    }

    private static Object firstNonNull(Object a, Object b) { return a != null ? a : b; }
    private static String str(Object v, String def) { return v != null ? v.toString() : def; }
    private static int toInt(Object v, int def) {
        if (v == null) return def;
        try { return Integer.parseInt(v.toString()); } catch (Exception e) { return def; }
    }
}
