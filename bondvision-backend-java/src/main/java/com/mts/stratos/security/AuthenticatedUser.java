package com.mts.stratos.security;

/**
 * Decoded JWT claims after session validation.
 */
public record AuthenticatedUser(String id, String username, String role, String sessionId) {
    public boolean isAdmin() {
        return "admin".equals(role);
    }
}
