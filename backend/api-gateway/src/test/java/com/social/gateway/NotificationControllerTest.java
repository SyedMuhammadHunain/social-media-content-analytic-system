package com.social.gateway;

import com.social.common.dto.NotificationRequest;
import com.social.common.model.Notification;
import com.social.common.model.NotificationType;
import com.social.gateway.controller.NotificationController;
import com.social.gateway.service.GatewayNotificationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@WebFluxTest(NotificationController.class)
class NotificationControllerTest {

    @Autowired
    private WebTestClient webTestClient;

    @MockitoBean
    private GatewayNotificationService notificationService;

    @Test
    @DisplayName("POST /v1/notifications returns 201 Created and persists notification")
    void testTriggerNotification() {
        Notification notification = Notification.builder()
                .id("notif_99")
                .recipientUserId("user_hunain")
                .actorUserId("user_alice")
                .actorName("Alice Walker")
                .type(NotificationType.LIKE)
                .targetPostId("post_01")
                .message("Alice Walker liked your post.")
                .read(false)
                .createdAt(Instant.now())
                .build();

        when(notificationService.triggerNotification(any(NotificationRequest.class)))
                .thenReturn(Mono.just(notification));

        NotificationRequest request = NotificationRequest.builder()
                .recipientUserId("user_hunain")
                .actorUserId("user_alice")
                .actorName("Alice Walker")
                .type(NotificationType.LIKE)
                .targetPostId("post_01")
                .message("Alice Walker liked your post.")
                .build();

        webTestClient.post()
                .uri("/v1/notifications")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isCreated()
                .expectBody()
                .jsonPath("$.status").isEqualTo("SUCCESS")
                .jsonPath("$.data.id").isEqualTo("notif_99")
                .jsonPath("$.data.recipientUserId").isEqualTo("user_hunain")
                .jsonPath("$.data.type").isEqualTo("LIKE")
                .jsonPath("$.data.read").isEqualTo(false);
    }

    @Test
    @DisplayName("GET /v1/notifications/{userId} returns chronological notifications")
    void testGetNotifications() {
        Notification n1 = Notification.builder()
                .id("notif_1")
                .recipientUserId("user_hunain")
                .actorName("Alice Walker")
                .type(NotificationType.LIKE)
                .message("Alice liked your post.")
                .read(false)
                .createdAt(Instant.now())
                .build();

        Notification n2 = Notification.builder()
                .id("notif_2")
                .recipientUserId("user_hunain")
                .actorName("Bob Creator")
                .type(NotificationType.COMMENT)
                .message("Bob commented on your post.")
                .read(true)
                .createdAt(Instant.now().minusSeconds(60))
                .build();

        when(notificationService.getNotifications("user_hunain"))
                .thenReturn(Flux.fromIterable(List.of(n1, n2)));

        webTestClient.get()
                .uri("/v1/notifications/user_hunain")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.status").isEqualTo("SUCCESS")
                .jsonPath("$.data.length()").isEqualTo(2)
                .jsonPath("$.data[0].id").isEqualTo("notif_1")
                .jsonPath("$.data[1].id").isEqualTo("notif_2");
    }

    @Test
    @DisplayName("GET /v1/notifications/{userId}/unread-count returns unread count")
    void testGetUnreadCount() {
        when(notificationService.getUnreadCount("user_hunain")).thenReturn(Mono.just(3L));

        webTestClient.get()
                .uri("/v1/notifications/user_hunain/unread-count")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.status").isEqualTo("SUCCESS")
                .jsonPath("$.data.userId").isEqualTo("user_hunain")
                .jsonPath("$.data.unreadCount").isEqualTo(3);
    }

    @Test
    @DisplayName("PUT /v1/notifications/{id}/read marks notification as read")
    void testMarkAsRead() {
        Notification n = Notification.builder()
                .id("notif_1")
                .recipientUserId("user_hunain")
                .read(true)
                .build();

        when(notificationService.markAsRead("notif_1")).thenReturn(Mono.just(n));

        webTestClient.put()
                .uri("/v1/notifications/notif_1/read")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.status").isEqualTo("SUCCESS")
                .jsonPath("$.data.id").isEqualTo("notif_1")
                .jsonPath("$.data.read").isEqualTo(true);
    }

    @Test
    @DisplayName("PUT /v1/notifications/{userId}/read-all marks all unread as read")
    void testMarkAllAsRead() {
        when(notificationService.markAllAsRead("user_hunain")).thenReturn(Mono.just(5L));

        webTestClient.put()
                .uri("/v1/notifications/user_hunain/read-all")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.status").isEqualTo("SUCCESS")
                .jsonPath("$.data.markedCount").isEqualTo(5);
    }
}
