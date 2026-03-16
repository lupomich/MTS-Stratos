package com.mts.stratos.auth;

import com.mts.stratos.auth.dto.LoginRequest;
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

import java.util.Map;

/**
 * Authentication controller — maps to Node.js routes/auth.js.
 *
 * Routes:
 *   POST /api/auth/login
 *   GET  /api/auth/me
 *   POST /api/auth/heartbeat
 *   POST /api/auth/logout
 */
@Controller("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Inject AuthService authService;
    @Inject SessionService sessionService;

    @Post("/login")
    public HttpResponse<?> login(@Body Map<String, Object> body) {
        try {
            LoginRequest request = new LoginRequest();
            request.setUsername(body != null ? (String) body.get("username") : null);
            request.setPassword(body != null ? (String) body.get("password") : null);
            Map<String, Object> result = authService.login(request);
            return HttpResponse.ok(result);
        } catch (AuthService.InvalidInputException e) {
            return HttpResponse.badRequest(Map.of("error", "Invalid input"));
        } catch (AuthService.InvalidCredentialsException e) {
            return HttpResponse.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
        } catch (AuthService.AlreadyLoggedInException e) {
            return HttpResponse.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "error", e.getMessage(),
                            "code", "ALREADY_LOGGED_IN",
                            "language", e.getLanguage()));
        } catch (Exception e) {
            log.error("Login error", e);
            return HttpResponse.serverError(Map.of("error", "Server error"));
        }
    }

    @Get("/me")
    public HttpResponse<?> me(HttpRequest<?> request) {
        try {
            AuthenticatedUser user = sessionService.requireAuth(request);
            sessionService.touchSessionAt(user.id());
            return HttpResponse.ok(Map.of(
                    "user", Map.of("id", user.id(), "username", user.username(), "role", user.role())));
        } catch (HttpStatusException e) {
            return HttpResponse.status(e.getStatus()).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("/me error", e);
            return HttpResponse.serverError(Map.of("error", "Server error"));
        }
    }

    @Post("/heartbeat")
    public HttpResponse<?> heartbeat(HttpRequest<?> request) {
        try {
            AuthenticatedUser user = sessionService.requireAuth(request);
            sessionService.touchSessionAt(user.id());
            sessionService.syncOnlineCache(user.id(), user.sessionId());
            return HttpResponse.ok(Map.of("ok", true));
        } catch (HttpStatusException e) {
            return HttpResponse.status(e.getStatus()).body(Map.of("error", e.getMessage()));
        }
    }

    @Post("/logout")
    public HttpResponse<?> logout(HttpRequest<?> request) {
        String authHeader = request.getHeaders().getFirst("Authorization").orElse(null);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                var claims = sessionService.decodeOptional(request);
                if (claims != null) {
                    authService.logout(claims.id());
                }
            } catch (Exception e) {
                log.warn("Logout token parse error: {}", e.getMessage());
            }
        }
        return HttpResponse.ok(Map.of("message", "Logged out successfully"));
    }
}
