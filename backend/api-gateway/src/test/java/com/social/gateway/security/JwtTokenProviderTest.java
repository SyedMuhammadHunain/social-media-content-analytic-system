package com.social.gateway.security;

import com.social.common.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Base64;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private final String testSecret = "my_super_secret_test_key_at_least_32_characters_long!";

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(testSecret);
    }

    @Test
    @DisplayName("generateToken returns valid 3-part compact JWT")
    void testGenerateTokenValidFormat() {
        User user = User.builder()
                .id("user_123")
                .username("testuser")
                .email("test@example.com")
                .createdAt(Instant.now())
                .build();

        String token = jwtTokenProvider.generateToken(user);
        assertNotNull(token);

        String[] parts = token.split("\\.");
        assertEquals(3, parts.length, "JWT must contain header, payload, and signature");
        assertTrue(parts[0].length() > 0);
        assertTrue(parts[1].length() > 0);
        assertTrue(parts[2].length() > 0);
    }

    @Test
    @DisplayName("validateToken succeeds for legitimately generated token")
    void testValidateTokenSuccess() {
        User user = User.builder()
                .id("user_hunain")
                .username("hunain")
                .email("hunain@example.com")
                .build();

        String token = jwtTokenProvider.generateToken(user);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("user_hunain", jwtTokenProvider.extractUserId(token));
        assertEquals("hunain", jwtTokenProvider.extractUsername(token));
    }

    @Test
    @DisplayName("extractClaims returns parsed payload claims")
    void testExtractClaims() {
        String token = jwtTokenProvider.generateToken("user_alice", "alice", "alice@example.com", 3600);
        Map<String, Object> claims = jwtTokenProvider.extractClaims(token);

        assertNotNull(claims);
        assertEquals("user_alice", claims.get("sub"));
        assertEquals("alice", claims.get("username"));
        assertEquals("alice@example.com", claims.get("email"));
        assertEquals("social-media-content-analysis-system", claims.get("iss"));
        assertNotNull(claims.get("iat"));
        assertNotNull(claims.get("exp"));
    }

    @Test
    @DisplayName("validateToken fails if payload is tampered")
    void testTamperedPayloadFailsValidation() {
        User user = User.builder()
                .id("user_victim")
                .username("victim")
                .email("victim@example.com")
                .build();

        String token = jwtTokenProvider.generateToken(user);
        String[] parts = token.split("\\.");

        // Tamper payload: replace "user_victim" with "user_attacker"
        String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]));
        String tamperedJson = payloadJson.replace("user_victim", "user_attacker");
        String tamperedPayload = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(tamperedJson.getBytes());

        String forgedToken = parts[0] + "." + tamperedPayload + "." + parts[2];
        assertFalse(jwtTokenProvider.validateToken(forgedToken), "Tampered token signature must fail");
    }

    @Test
    @DisplayName("validateToken fails if signature is altered")
    void testTamperedSignatureFailsValidation() {
        User user = User.builder()
                .id("user_1")
                .username("u1")
                .build();

        String token = jwtTokenProvider.generateToken(user);
        String[] parts = token.split("\\.");

        // Invalidate last character of signature
        String tamperedSig = parts[2].substring(0, parts[2].length() - 1) + "X";
        String forgedToken = parts[0] + "." + parts[1] + "." + tamperedSig;

        assertFalse(jwtTokenProvider.validateToken(forgedToken));
    }

    @Test
    @DisplayName("validateToken fails if token is expired")
    void testExpiredTokenFailsValidation() {
        // Generate token with negative validity (-10 seconds)
        String expiredToken = jwtTokenProvider.generateToken("user_exp", "expired", "exp@example.com", -10);

        assertFalse(jwtTokenProvider.validateToken(expiredToken), "Expired token must fail validation");
    }

    @Test
    @DisplayName("validateToken safely returns false on malformed inputs")
    void testMalformedInputs() {
        assertFalse(jwtTokenProvider.validateToken(null));
        assertFalse(jwtTokenProvider.validateToken(""));
        assertFalse(jwtTokenProvider.validateToken("not-a-jwt"));
        assertFalse(jwtTokenProvider.validateToken("part1.part2"));
        assertFalse(jwtTokenProvider.validateToken("part1.part2.part3.extra"));
    }
}
