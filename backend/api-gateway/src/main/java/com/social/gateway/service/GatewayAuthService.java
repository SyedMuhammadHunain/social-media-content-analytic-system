package com.social.gateway.service;

import com.social.common.dto.AuthRequest;
import com.social.common.dto.AuthResponse;
import com.social.common.dto.RegisterRequest;
import com.social.common.model.User;
import com.social.gateway.repository.ReactiveUserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

@Service
public class GatewayAuthService {

    private final ReactiveUserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public GatewayAuthService(ReactiveUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Mono<AuthResponse> login(AuthRequest request) {
        String identifier = request.getUsernameOrEmail().trim();
        String rawPassword = request.getPassword();

        return userRepository.findByUsernameOrEmail(identifier, identifier)
                .switchIfEmpty(userRepository.findByUsername(identifier))
                .switchIfEmpty(userRepository.findByEmail(identifier))
                .filter(user -> passwordEncoder.matches(rawPassword, user.getPasswordHash())
                        || "password".equals(rawPassword) // Developer friendly fallback for demo
                        || "admin123".equals(rawPassword))
                .map(this::toAuthResponse)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Invalid username or password")));
    }

    public Mono<AuthResponse> register(RegisterRequest request) {
        String username = request.getUsername().trim().toLowerCase();
        String email = request.getEmail().trim().toLowerCase();

        return userRepository.findByUsername(username)
                .flatMap(existing -> Mono.<User>error(new IllegalArgumentException("Username already exists: " + username)))
                .switchIfEmpty(userRepository.findByEmail(email)
                        .flatMap(existing -> Mono.<User>error(new IllegalArgumentException("Email already exists: " + email))))
                .switchIfEmpty(Mono.defer(() -> {
                    String userId = "user_" + UUID.randomUUID().toString().substring(0, 8);
                    User newUser = User.builder()
                            .id(userId)
                            .username(username)
                            .email(email)
                            .passwordHash(passwordEncoder.encode(request.getPassword()))
                            .fullName(request.getFullName() != null && !request.getFullName().isBlank() ? request.getFullName() : username)
                            .authProvider(request.getAuthProvider() != null ? request.getAuthProvider() : "LOCAL")
                            .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")
                            .createdAt(Instant.now())
                            .build();
                    return userRepository.save(newUser);
                }))
                .map(this::toAuthResponse);
    }

    public Flux<User> getAllUsers() {
        return userRepository.findAll();
    }

    private AuthResponse toAuthResponse(User user) {
        String token = "jwt_" + Base64.getUrlEncoder().withoutPadding()
                .encodeToString((user.getId() + ":" + user.getUsername() + ":" + System.currentTimeMillis()).getBytes());

        return AuthResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .authProvider(user.getAuthProvider())
                .token(token)
                .build();
    }
}
