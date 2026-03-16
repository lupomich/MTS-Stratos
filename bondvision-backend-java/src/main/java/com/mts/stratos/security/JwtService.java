package com.mts.stratos.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.micronaut.context.annotation.Value;
import jakarta.inject.Singleton;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

/**
 * JWT service — HS256 compatible with Node.js jsonwebtoken.
 *
 * Uses SecretKeySpec directly (no minimum-length enforcement) so we stay
 * byte-for-byte compatible with tokens issued by the Node.js backend.
 */
@Singleton
public class JwtService {

    private final SecretKey secretKey;

    public JwtService(@Value("${app.jwt-secret}") String jwtSecret) {
        this.secretKey = new SecretKeySpec(
                jwtSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    }

    public String createToken(String userId, String username, String role, String sessionId) {
        return Jwts.builder()
                .claim("id", userId)
                .claim("username", username)
                .claim("role", role)
                .claim("sessionId", sessionId)
                .issuedAt(new Date())
                .expiration(Date.from(Instant.now().plus(24, ChronoUnit.HOURS)))
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Parses and validates a JWT token.
     * @throws JwtException if token is invalid or expired
     */
    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
