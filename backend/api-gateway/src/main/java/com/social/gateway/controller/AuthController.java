package com.social.gateway.controller;

import com.social.common.dto.ApiResponse;
import com.social.common.dto.AuthRequest;
import com.social.common.dto.AuthResponse;
import com.social.common.dto.RegisterRequest;
import com.social.common.model.User;
import com.social.gateway.service.GatewayAuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/auth")
public class AuthController {

    private final GatewayAuthService authService;

    public AuthController(GatewayAuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public Mono<ResponseEntity<ApiResponse<AuthResponse>>> login(@Valid @RequestBody AuthRequest request) {
        return authService.login(request)
                .map(auth -> ResponseEntity.ok(ApiResponse.success(auth, "Login successful")))
                .onErrorResume(IllegalArgumentException.class, e -> Mono.just(
                        ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(ApiResponse.<AuthResponse>builder()
                                        .status("ERROR")
                                        .message(e.getMessage())
                                        .build())
                ));
    }

    @PostMapping("/register")
    public Mono<ResponseEntity<ApiResponse<AuthResponse>>> register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request)
                .map(auth -> ResponseEntity.status(HttpStatus.CREATED)
                        .body(ApiResponse.success(auth, "User registered successfully")))
                .onErrorResume(IllegalArgumentException.class, e -> Mono.just(
                        ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(ApiResponse.<AuthResponse>builder()
                                        .status("ERROR")
                                        .message(e.getMessage())
                                        .build())
                ));
    }

    @GetMapping("/users")
    public Mono<ResponseEntity<ApiResponse<List<Map<String, String>>>>> getDemoUsers() {
        return authService.getAllUsers()
                .map(u -> Map.of(
                        "id", u.getId(),
                        "username", u.getUsername(),
                        "name", u.getFullName() != null ? u.getFullName() : u.getUsername(),
                        "avatarUrl", u.getAvatarUrl() != null ? u.getAvatarUrl() : ""
                ))
                .collectList()
                .map(users -> ResponseEntity.ok(ApiResponse.success(users, "Demo users fetched")));
    }
}
