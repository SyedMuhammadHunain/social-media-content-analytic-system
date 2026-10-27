package com.social.gateway.controller;

import com.social.common.dto.ApiResponse;
import com.social.common.dto.NotificationRequest;
import com.social.common.model.Notification;
import com.social.gateway.service.GatewayNotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/notifications")
public class NotificationController {

    private final GatewayNotificationService notificationService;

    public NotificationController(GatewayNotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping
    public Mono<ResponseEntity<ApiResponse<Notification>>> triggerNotification(
            @Valid @RequestBody NotificationRequest request) {
        return notificationService.triggerNotification(request)
                .map(n -> ResponseEntity.status(HttpStatus.CREATED)
                        .body(ApiResponse.success(n, "Notification triggered successfully.")));
    }

    @GetMapping("/{userId}")
    public Mono<ResponseEntity<ApiResponse<List<Notification>>>> getNotifications(
            @PathVariable String userId) {
        return notificationService.getNotifications(userId)
                .collectList()
                .map(list -> ResponseEntity.ok(ApiResponse.success(list, "Notifications retrieved successfully.")));
    }

    @GetMapping("/{userId}/unread-count")
    public Mono<ResponseEntity<ApiResponse<Map<String, Object>>>> getUnreadCount(
            @PathVariable String userId) {
        return notificationService.getUnreadCount(userId)
                .map(count -> ResponseEntity.ok(ApiResponse.success(
                        Map.of("userId", userId, "unreadCount", count),
                        "Unread count retrieved successfully."
                )));
    }

    @PutMapping("/{id}/read")
    public Mono<ResponseEntity<ApiResponse<Notification>>> markAsRead(
            @PathVariable String id) {
        return notificationService.markAsRead(id)
                .map(n -> ResponseEntity.ok(ApiResponse.success(n, "Notification marked as read.")))
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PutMapping("/{userId}/read-all")
    public Mono<ResponseEntity<ApiResponse<Map<String, Object>>>> markAllAsRead(
            @PathVariable String userId) {
        return notificationService.markAllAsRead(userId)
                .map(count -> ResponseEntity.ok(ApiResponse.success(
                        Map.of("userId", userId, "markedCount", count),
                        "All notifications marked as read."
                )));
    }
}
