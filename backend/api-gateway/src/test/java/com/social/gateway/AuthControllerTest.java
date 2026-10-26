package com.social.gateway;

import com.social.common.dto.AuthRequest;
import com.social.common.dto.AuthResponse;
import com.social.common.dto.RegisterRequest;
import com.social.common.model.User;
import com.social.gateway.controller.AuthController;
import com.social.gateway.service.GatewayAuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@WebFluxTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private WebTestClient webTestClient;

    @MockitoBean
    private GatewayAuthService authService;

    @Test
    @DisplayName("POST /v1/auth/login returns 200 with AuthResponse on valid credentials")
    void testLoginSuccess() {
        AuthResponse response = AuthResponse.builder()
                .userId("user_hunain")
                .username("hunain")
                .email("hunain@example.com")
                .fullName("Syed Muhammad Hunain")
                .token("jwt_sample_token_123")
                .build();

        when(authService.login(any(AuthRequest.class))).thenReturn(Mono.just(response));

        AuthRequest request = AuthRequest.builder()
                .usernameOrEmail("hunain")
                .password("password")
                .build();

        webTestClient.post()
                .uri("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.status").isEqualTo("SUCCESS")
                .jsonPath("$.data.userId").isEqualTo("user_hunain")
                .jsonPath("$.data.username").isEqualTo("hunain")
                .jsonPath("$.data.token").isEqualTo("jwt_sample_token_123");
    }

    @Test
    @DisplayName("POST /v1/auth/login returns 401 on invalid credentials")
    void testLoginFailure() {
        when(authService.login(any(AuthRequest.class)))
                .thenReturn(Mono.error(new IllegalArgumentException("Invalid username or password")));

        AuthRequest request = AuthRequest.builder()
                .usernameOrEmail("hunain")
                .password("wrongpassword")
                .build();

        webTestClient.post()
                .uri("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isUnauthorized()
                .expectBody()
                .jsonPath("$.status").isEqualTo("ERROR")
                .jsonPath("$.message").isEqualTo("Invalid username or password");
    }

    @Test
    @DisplayName("POST /v1/auth/register returns 201 with AuthResponse")
    void testRegisterSuccess() {
        AuthResponse response = AuthResponse.builder()
                .userId("user_new")
                .username("newuser")
                .email("new@example.com")
                .fullName("New User")
                .token("jwt_new_token")
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(Mono.just(response));

        RegisterRequest request = RegisterRequest.builder()
                .username("newuser")
                .email("new@example.com")
                .password("securePass123")
                .fullName("New User")
                .build();

        webTestClient.post()
                .uri("/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isCreated()
                .expectBody()
                .jsonPath("$.status").isEqualTo("SUCCESS")
                .jsonPath("$.data.userId").isEqualTo("user_new")
                .jsonPath("$.data.username").isEqualTo("newuser");
    }

    @Test
    @DisplayName("GET /v1/auth/users returns demo users list")
    void testGetDemoUsers() {
        User u1 = User.builder().id("user_hunain").username("hunain").fullName("Syed Hunain").build();
        User u2 = User.builder().id("user_alice").username("alice_tech").fullName("Alice Vance").build();

        when(authService.getAllUsers()).thenReturn(Flux.just(u1, u2));

        webTestClient.get()
                .uri("/v1/auth/users")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.status").isEqualTo("SUCCESS")
                .jsonPath("$.data.length()").isEqualTo(2)
                .jsonPath("$.data[0].username").isEqualTo("hunain")
                .jsonPath("$.data[1].username").isEqualTo("alice_tech");
    }
}
