package com.ecoverse.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    private static final long DEFAULT_EXPIRATION_MS = 24 * 60 * 60 * 1000L;

    @Value("${ecoverse.jwt.secret}")
    private String secret;

    @Value("${ecoverse.jwt.expiration:86400000}")
    private long expiration;

    // ── build signing key from hex secret ──────────────────────────────────
    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // ── generate a token for the given email ──────────────────────────────
    public String generateToken(String email) {
        long expirationMs = resolveExpirationMs();
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    // ── extract email (subject) from token ────────────────────────────────
    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    // ── validate: parse succeeds + token not expired ──────────────────────
    public boolean isTokenValid(String token) {
        try {
            Claims claims = parseClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // ── internal: parse and return claims ─────────────────────────────────
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private long resolveExpirationMs() {
        if (expiration <= 0) return DEFAULT_EXPIRATION_MS;
        // Backward compatibility: if configured as seconds (e.g., 3600), convert to ms.
        if (expiration < 100_000L) return expiration * 1000L;
        return expiration;
    }
}
