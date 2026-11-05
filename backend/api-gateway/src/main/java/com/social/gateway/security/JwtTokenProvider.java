package com.social.gateway.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.social.common.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenProvider {

    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final String DEFAULT_SECRET = "smcas_secure_jwt_hmac256_secret_key_prod_32bytes_min!";
    private static final long TOKEN_VALIDITY_SECONDS = 7 * 24 * 3600; // 7 days

    private final byte[] secretKeyBytes;
    private final ObjectMapper objectMapper;

    public JwtTokenProvider(@Value("${jwt.secret:}") String jwtSecret) {
        String secret = (jwtSecret != null && !jwtSecret.isBlank())
                ? jwtSecret
                : System.getenv().getOrDefault("JWT_SECRET", DEFAULT_SECRET);
        this.secretKeyBytes = secret.getBytes(StandardCharsets.UTF_8);
        this.objectMapper = new ObjectMapper();
    }

    public String generateToken(User user) {
        return generateToken(user.getId(), user.getUsername(), user.getEmail(), TOKEN_VALIDITY_SECONDS);
    }

    public String generateToken(String userId, String username, String email, long validitySeconds) {
        try {
            long now = Instant.now().getEpochSecond();
            long exp = now + validitySeconds;

            Map<String, Object> header = Map.of(
                    "alg", "HS256",
                    "typ", "JWT"
            );
            String encodedHeader = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(objectMapper.writeValueAsString(header).getBytes(StandardCharsets.UTF_8));

            Map<String, Object> claims = new HashMap<>();
            claims.put("sub", userId);
            claims.put("username", username != null ? username : "");
            claims.put("email", email != null ? email : "");
            claims.put("iss", "social-media-content-analysis-system");
            claims.put("iat", now);
            claims.put("exp", exp);

            String encodedPayload = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(objectMapper.writeValueAsString(claims).getBytes(StandardCharsets.UTF_8));

            String signingInput = encodedHeader + "." + encodedPayload;
            String signature = sign(signingInput);

            return signingInput + "." + signature;
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate JWT token", e);
        }
    }

    public boolean validateToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }

        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return false;
        }

        try {
            String signingInput = parts[0] + "." + parts[1];
            String expectedSignature = sign(signingInput);

            byte[] expectedBytes = expectedSignature.getBytes(StandardCharsets.UTF_8);
            byte[] actualBytes = parts[2].getBytes(StandardCharsets.UTF_8);

            // Constant-time signature comparison to eliminate timing attack vectors
            if (!MessageDigest.isEqual(expectedBytes, actualBytes)) {
                return false;
            }

            Map<String, Object> claims = extractClaims(token);
            if (claims == null || !claims.containsKey("exp")) {
                return false;
            }

            long exp = Long.parseLong(claims.get("exp").toString());
            return exp > Instant.now().getEpochSecond();
        } catch (Exception e) {
            return false;
        }
    }

    public Map<String, Object> extractClaims(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return null;
        }
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
            return objectMapper.readValue(decoded, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return null;
        }
    }

    public String extractUserId(String token) {
        Map<String, Object> claims = extractClaims(token);
        return claims != null ? (String) claims.get("sub") : null;
    }

    public String extractUsername(String token) {
        Map<String, Object> claims = extractClaims(token);
        return claims != null ? (String) claims.get("username") : null;
    }

    private String sign(String data) throws NoSuchAlgorithmException, InvalidKeyException {
        Mac mac = Mac.getInstance(HMAC_SHA256);
        SecretKeySpec secretKeySpec = new SecretKeySpec(secretKeyBytes, HMAC_SHA256);
        mac.init(secretKeySpec);
        byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(hmacBytes);
    }
}
