package com.social.gateway.service;

import com.social.common.dto.AuthRequest;
import com.social.common.dto.AuthResponse;
import com.social.common.model.User;
import com.social.gateway.repository.ReactiveUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GatewayAuthServiceTest {

    @Mock
    private ReactiveUserRepository userRepository;

    private GatewayAuthService authService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private User targetUser;
    private final String realPassword = "VerySecurePassword!999";

    @BeforeEach
    void setUp() {
        authService = new GatewayAuthService(userRepository);

        org.mockito.Mockito.lenient().when(userRepository.findByUsername(anyString())).thenReturn(Mono.empty());
        org.mockito.Mockito.lenient().when(userRepository.findByEmail(anyString())).thenReturn(Mono.empty());
        org.mockito.Mockito.lenient().when(userRepository.findByUsernameOrEmail(anyString(), anyString())).thenReturn(Mono.empty());
        org.mockito.Mockito.lenient().when(userRepository.save(any(User.class))).thenAnswer(invocation -> Mono.just(invocation.getArgument(0)));

        targetUser = User.builder()
                .id("user_target")
                .username("target_admin")
                .email("admin@company.com")
                .fullName("System Admin")
                .passwordHash(passwordEncoder.encode(realPassword))
                .authProvider("LOCAL")
                .createdAt(Instant.now())
                .build();
    }

    @Test
    @DisplayName("login succeeds when password matches BCrypt hash")
    void testLoginSuccessWithRealPassword() {
        when(userRepository.findByUsernameOrEmail("target_admin", "target_admin"))
                .thenReturn(Mono.just(targetUser));

        AuthRequest request = AuthRequest.builder()
                .usernameOrEmail("target_admin")
                .password(realPassword)
                .build();

        StepVerifier.create(authService.login(request))
                .assertNext(response -> {
                    assertNotNull(response);
                    assertEquals("user_target", response.getUserId());
                    assertEquals("target_admin", response.getUsername());
                    assertNotNull(response.getToken());
                })
                .verifyComplete();
    }

    @Test
    @DisplayName("login rejects arbitrary wrong password")
    void testLoginRejectsWrongPassword() {
        when(userRepository.findByUsernameOrEmail("target_admin", "target_admin"))
                .thenReturn(Mono.just(targetUser));

        AuthRequest request = AuthRequest.builder()
                .usernameOrEmail("target_admin")
                .password("wrong_guess_123")
                .build();

        StepVerifier.create(authService.login(request))
                .expectErrorMatches(err -> err instanceof IllegalArgumentException &&
                        err.getMessage().equals("Invalid username or password"))
                .verify();
    }

    @Test
    @DisplayName("login rejects hardcoded bypass 'password123'")
    void testLoginRejectsHardcodedPassword123Bypass() {
        when(userRepository.findByUsernameOrEmail("target_admin", "target_admin"))
                .thenReturn(Mono.just(targetUser));

        AuthRequest request = AuthRequest.builder()
                .usernameOrEmail("target_admin")
                .password("password123")
                .build();

        StepVerifier.create(authService.login(request))
                .expectErrorMatches(err -> err instanceof IllegalArgumentException &&
                        err.getMessage().equals("Invalid username or password"))
                .verify();
    }

    @Test
    @DisplayName("login rejects hardcoded bypass 'admin123'")
    void testLoginRejectsHardcodedAdmin123Bypass() {
        when(userRepository.findByUsernameOrEmail("target_admin", "target_admin"))
                .thenReturn(Mono.just(targetUser));

        AuthRequest request = AuthRequest.builder()
                .usernameOrEmail("target_admin")
                .password("admin123")
                .build();

        StepVerifier.create(authService.login(request))
                .expectErrorMatches(err -> err instanceof IllegalArgumentException &&
                        err.getMessage().equals("Invalid username or password"))
                .verify();
    }

    @Test
    @DisplayName("login rejects hardcoded bypass 'password'")
    void testLoginRejectsHardcodedPasswordBypass() {
        when(userRepository.findByUsernameOrEmail("target_admin", "target_admin"))
                .thenReturn(Mono.just(targetUser));

        AuthRequest request = AuthRequest.builder()
                .usernameOrEmail("target_admin")
                .password("password")
                .build();

        StepVerifier.create(authService.login(request))
                .expectErrorMatches(err -> err instanceof IllegalArgumentException &&
                        err.getMessage().equals("Invalid username or password"))
                .verify();
    }

    @Test
    @DisplayName("login rejects goog_oauth_ prefix fake password")
    void testLoginRejectsGoogleOAuthPrefixPassword() {
        when(userRepository.findByUsernameOrEmail("target_admin", "target_admin"))
                .thenReturn(Mono.just(targetUser));

        AuthRequest request = AuthRequest.builder()
                .usernameOrEmail("target_admin")
                .password("goog_oauth_target_admin")
                .build();

        StepVerifier.create(authService.login(request))
                .expectErrorMatches(err -> err instanceof IllegalArgumentException &&
                        err.getMessage().equals("Invalid username or password"))
                .verify();
    }

    @Test
    @DisplayName("login rejects when user has authProvider GOOGLE but wrong password is submitted")
    void testLoginRejectsGoogleAuthProviderWithoutValidCredentials() {
        User googleUser = User.builder()
                .id("user_google")
                .username("google_user")
                .email("google@gmail.com")
                .authProvider("GOOGLE")
                .passwordHash(passwordEncoder.encode("SecretRandomHash!"))
                .build();

        when(userRepository.findByUsernameOrEmail("google_user", "google_user"))
                .thenReturn(Mono.just(googleUser));

        AuthRequest request = AuthRequest.builder()
                .usernameOrEmail("google_user")
                .password("anything_random")
                .build();

        StepVerifier.create(authService.login(request))
                .expectErrorMatches(err -> err instanceof IllegalArgumentException &&
                        err.getMessage().equals("Invalid username or password"))
                .verify();
    }

    @Test
    @DisplayName("loginWithGoogle creates new user with GOOGLE provider and returns signed token")
    void testLoginWithGoogleNewUser() {
        when(userRepository.findByEmail("newgoogle@example.com")).thenReturn(Mono.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            return Mono.just(u);
        });

        com.social.common.dto.GoogleAuthRequest request = com.social.common.dto.GoogleAuthRequest.builder()
                .email("newgoogle@example.com")
                .name("New Google User")
                .avatarUrl("https://example.com/avatar.jpg")
                .googleId("google_sub_12345")
                .build();

        StepVerifier.create(authService.loginWithGoogle(request))
                .assertNext(response -> {
                    assertNotNull(response);
                    assertEquals("newgoogle@example.com", response.getEmail());
                    assertEquals("GOOGLE", response.getAuthProvider());
                    assertEquals("New Google User", response.getFullName());
                    assertNotNull(response.getToken());
                    assertEquals(3, response.getToken().split("\\.").length);
                })
                .verifyComplete();
    }

    @Test
    @DisplayName("loginWithGoogle logs in existing user and returns signed token")
    void testLoginWithGoogleExistingUser() {
        User existing = User.builder()
                .id("user_existing_goog")
                .username("existing_goog")
                .email("existing@example.com")
                .fullName("Existing Google User")
                .authProvider("GOOGLE")
                .passwordHash("hashed")
                .build();

        when(userRepository.findByEmail("existing@example.com")).thenReturn(Mono.just(existing));

        com.social.common.dto.GoogleAuthRequest request = com.social.common.dto.GoogleAuthRequest.builder()
                .email("existing@example.com")
                .name("Existing Google User")
                .googleId("google_id_existing_999")
                .build();

        StepVerifier.create(authService.loginWithGoogle(request))
                .assertNext(response -> {
                    assertNotNull(response);
                    assertEquals("user_existing_goog", response.getUserId());
                    assertEquals("existing@example.com", response.getEmail());
                    assertNotNull(response.getToken());
                    assertEquals(3, response.getToken().split("\\.").length);
                })
                .verifyComplete();
    }

    @Test
    @DisplayName("loginWithGoogle prevents account takeover when target user was created with LOCAL password")
    void testLoginWithGoogleRejectsAccountTakeoverOnLocalUser() {
        User localUser = User.builder()
                .id("user_local_victim")
                .username("victim")
                .email("victim@example.com")
                .authProvider("LOCAL")
                .passwordHash("someBcryptHash")
                .build();

        when(userRepository.findByEmail("victim@example.com")).thenReturn(Mono.just(localUser));

        com.social.common.dto.GoogleAuthRequest request = com.social.common.dto.GoogleAuthRequest.builder()
                .email("victim@example.com")
                .googleId("attacker_google_id")
                .build();

        StepVerifier.create(authService.loginWithGoogle(request))
                .expectErrorMatches(err -> err instanceof IllegalArgumentException &&
                        err.getMessage().contains("Account registered with email and password"))
                .verify();
    }

    @Test
    @DisplayName("loginWithGoogle rejects request without googleId or idToken")
    void testLoginWithGoogleRejectsMissingCredentials() {
        com.social.common.dto.GoogleAuthRequest request = com.social.common.dto.GoogleAuthRequest.builder()
                .email("unknown@example.com")
                .name("No Token User")
                .build();

        StepVerifier.create(authService.loginWithGoogle(request))
                .expectErrorMatches(err -> err instanceof IllegalArgumentException &&
                        err.getMessage().contains("Valid Google authentication credentials required"))
                .verify();
    }
}
