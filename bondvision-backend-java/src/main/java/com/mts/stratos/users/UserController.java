package com.mts.stratos.users;

import at.favre.lib.crypto.bcrypt.BCrypt;
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
 * Users controller — admin only. Maps to Node.js routes/users.js.
 *
 * Routes:
 *   GET    /api/users
 *   POST   /api/users
 *   PUT    /api/users/:id
 *   DELETE /api/users/:id
 */
@Controller("/api/users")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    @Inject SessionService sessionService;
    @Inject DataSource dataSource;

    @Get
    public HttpResponse<?> list(HttpRequest<?> request) {
        try {
            sessionService.requireAdmin(request);
        } catch (HttpStatusException e) {
            return HttpResponse.status(e.getStatus()).body(Map.of("error", e.getMessage()));
        }
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(
                     "SELECT u.id, u.username, u.email, u.role, u.is_active, u.last_login, " +
                     "u.created_by, c.username AS created_by_username " +
                     "FROM users u LEFT JOIN users c ON c.id = u.created_by ORDER BY u.username")) {
            try (ResultSet rs = ps.executeQuery()) {
                List<Map<String, Object>> users = new ArrayList<>();
                while (rs.next()) {
                    Map<String, Object> user = new LinkedHashMap<>();
                    user.put("id", rs.getString("id"));
                    user.put("username", rs.getString("username"));
                    user.put("email", rs.getString("email"));
                    user.put("role", rs.getString("role"));
                    user.put("is_active", rs.getBoolean("is_active"));
                    user.put("last_login", rs.getTimestamp("last_login"));
                    user.put("created_by", rs.getString("created_by"));
                    user.put("created_by_username", rs.getString("created_by_username"));
                    users.add(user);
                }
                return HttpResponse.ok(Map.of("users", users));
            }
        } catch (Exception e) {
            log.error("GET /users error", e);
            return HttpResponse.serverError(Map.of("error", "Server error"));
        }
    }

    @Post
    public HttpResponse<?> create(HttpRequest<?> request, @Body Map<String, Object> body) {
        AuthenticatedUser admin;
        try {
            admin = sessionService.requireAdmin(request);
        } catch (HttpStatusException e) {
            return HttpResponse.status(e.getStatus()).body(Map.of("error", e.getMessage()));
        }

        String username = body != null ? (String) body.get("username") : null;
        String email    = body != null ? (String) body.get("email")    : null;
        String password = body != null ? (String) body.get("password") : null;
        String role     = body != null ? (String) body.get("role")     : null;

        // Validation
        if (username == null || username.length() < 3 ||
            email == null || email.isEmpty() ||
            password == null || password.length() < 8 ||
            !List.of("admin", "trader", "viewer").contains(role)) {
            return HttpResponse.badRequest(Map.of("error", "Invalid input"));
        }

        try (Connection conn = dataSource.getConnection()) {
            // Check duplicate
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT 1 FROM users WHERE username = ? OR email = ?")) {
                ps.setString(1, username);
                ps.setString(2, email);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        return HttpResponse.status(HttpStatus.CONFLICT)
                                .body(Map.of("error", "Username or email already exists"));
                    }
                }
            }

            String hash = BCrypt.withDefaults().hashToString(10, password.toCharArray());

            try (PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO users (username, email, password_hash, role, is_active, created_by) " +
                    "VALUES (?, ?, ?, ?, true, ?)")) {
                ps.setString(1, username);
                ps.setString(2, email);
                ps.setString(3, hash);
                ps.setString(4, role);
                ps.setObject(5, UUID.fromString(admin.id()));
                ps.executeUpdate();
            }
            return HttpResponse.ok(Map.of("message", "User created"));
        } catch (Exception e) {
            log.error("POST /users error", e);
            return HttpResponse.serverError(Map.of("error", "Server error"));
        }
    }

    @Put("/{id}")
    public HttpResponse<?> update(HttpRequest<?> request, String id, @Body Map<String, Object> body) {
        try {
            sessionService.requireAdmin(request);
        } catch (HttpStatusException e) {
            return HttpResponse.status(e.getStatus()).body(Map.of("error", e.getMessage()));
        }

        Boolean isActive = (body != null && body.containsKey("is_active")) ? (Boolean) body.get("is_active") : null;
        String  role     = body != null ? (String) body.get("role")     : null;
        String  password = body != null ? (String) body.get("password") : null;

        List<String> setClauses = new ArrayList<>();
        List<Object> values = new ArrayList<>();

        if (isActive != null)  { setClauses.add("is_active = ?"); values.add(isActive); }
        if (role     != null)  { setClauses.add("role = ?");      values.add(role); }
        if (password != null) {
            String hash = BCrypt.withDefaults().hashToString(10, password.toCharArray());
            setClauses.add("password_hash = ?");
            values.add(hash);
        }

        if (setClauses.isEmpty()) {
            return HttpResponse.badRequest(Map.of("error", "No updates provided"));
        }

        values.add(id);
        String sql = "UPDATE users SET " + String.join(", ", setClauses) + " WHERE id = ?::uuid RETURNING id";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < values.size(); i++) {
                ps.setObject(i + 1, values.get(i));
            }
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) return HttpResponse.notFound(Map.of("error", "User not found"));
            }
            return HttpResponse.ok(Map.of("message", "User updated"));
        } catch (Exception e) {
            log.error("PUT /users/{} error", id, e);
            return HttpResponse.serverError(Map.of("error", "Server error"));
        }
    }

    @Delete("/{id}")
    public HttpResponse<?> delete(HttpRequest<?> request, String id) {
        try {
            sessionService.requireAdmin(request);
        } catch (HttpStatusException e) {
            return HttpResponse.status(e.getStatus()).body(Map.of("error", e.getMessage()));
        }
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(
                     "DELETE FROM users WHERE id = ?::uuid RETURNING id")) {
            ps.setString(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) return HttpResponse.notFound(Map.of("error", "User not found"));
            }
            return HttpResponse.ok(Map.of("message", "User deleted"));
        } catch (Exception e) {
            log.error("DELETE /users/{} error", id, e);
            return HttpResponse.serverError(Map.of("error", "Server error"));
        }
    }
}
