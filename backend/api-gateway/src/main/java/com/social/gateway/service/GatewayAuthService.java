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
        String rawIdentifier = request.getUsernameOrEmail() != null ? request.getUsernameOrEmail().trim() : "";
        String normalized = rawIdentifier.toLowerCase();
        String rawPassword = request.getPassword();

        String targetIdentifier = ("hunain_creator".equals(normalized) || "usr_me_01".equals(normalized)) ? "hunain" : normalized;

        return userRepository.findByUsernameOrEmail(targetIdentifier, targetIdentifier)
                .switchIfEmpty(Mono.defer(() -> userRepository.findByUsername(targetIdentifier)))
                .switchIfEmpty(Mono.defer(() -> userRepository.findByEmail(targetIdentifier)))
                .switchIfEmpty(Mono.defer(() -> userRepository.findByUsernameOrEmail(rawIdentifier, rawIdentifier)))
                .switchIfEmpty(Mono.defer(() -> userRepository.findByUsername(rawIdentifier)))
                .switchIfEmpty(Mono.defer(() -> userRepository.findByEmail(rawIdentifier)))
                .filter(user -> rawPassword != null
                        && user.getPasswordHash() != null
                        && passwordEncoder.matches(rawPassword, user.getPasswordHash()))
                .map(this::toAuthResponse)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Invalid username or password")));
    }

    public Mono<AuthResponse> register(RegisterRequest request) {
        String username = request.getUsername().trim().toLowerCase();
        String email = request.getEmail().trim().toLowerCase();
        boolean isGoogleAuth = "GOOGLE".equalsIgnoreCase(request.getAuthProvider())
                || (request.getPassword() != null && request.getPassword().startsWith("goog_oauth_"));

        return userRepository.findByUsername(username)
                .flatMap(existing -> {
                    if (isGoogleAuth && email.equalsIgnoreCase(existing.getEmail())) {
                        return Mono.just(existing);
                    }
                    return Mono.<User>error(new IllegalArgumentException("Username already exists: " + username));
                })
                .switchIfEmpty(Mono.defer(() -> userRepository.findByEmail(email)
                        .flatMap(existing -> {
                            if (isGoogleAuth) {
                                return Mono.just(existing);
                            }
                            return Mono.<User>error(new IllegalArgumentException("Email already exists: " + email));
                        })))
                .switchIfEmpty(Mono.defer(() -> {
                    String userId = "user_" + UUID.randomUUID().toString().substring(0, 8);
                    User newUser = User.builder()
                            .id(userId)
                            .username(username)
                            .email(email)
                            .passwordHash(passwordEncoder.encode(request.getPassword()))
                            .fullName(request.getFullName() != null && !request.getFullName().isBlank() ? request.getFullName() : username)
                            .authProvider(request.getAuthProvider() != null ? request.getAuthProvider() : "LOCAL")
                            .avatarUrl(request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()
                                    ? request.getAvatarUrl()
                                    : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")
                            .createdAt(Instant.now())
                            .build();
                    return userRepository.save(newUser);
                }))
                .map(this::toAuthResponse);
    }

    public Mono<User> updateProfile(String userId, java.util.Map<String, String> updates) {
        return userRepository.findById(userId)
                .switchIfEmpty(userRepository.findByUsername(userId.toLowerCase()))
                .flatMap(user -> {
                    if (updates.containsKey("fullName") && updates.get("fullName") != null && !updates.get("fullName").isBlank()) {
                        user.setFullName(updates.get("fullName"));
                    }
                    if (updates.containsKey("avatarUrl") && updates.get("avatarUrl") != null && !updates.get("avatarUrl").isBlank()) {
                        user.setAvatarUrl(updates.get("avatarUrl"));
                    }
                    if (updates.containsKey("bio") && updates.get("bio") != null) {
                        user.setBio(updates.get("bio"));
                    }
                    if (updates.containsKey("coverBannerUrl") && updates.get("coverBannerUrl") != null) {
                        user.setCoverBannerUrl(updates.get("coverBannerUrl"));
                    }
                    return userRepository.save(user);
                });
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
                .avatarUrl(user.getAvatarUrl())
                .coverBannerUrl(user.getCoverBannerUrl())
                .bio(user.getBio())
                .token(token)
                .build();
    }
}
