package com.social.gateway.service;

import com.social.common.dto.NotificationRequest;
import com.social.common.model.Notification;
import com.social.common.model.NotificationType;
import com.social.gateway.repository.ReactiveNotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class GatewayNotificationService {

    private static final Logger log = LoggerFactory.getLogger(GatewayNotificationService.class);

    private final ReactiveNotificationRepository notificationRepository;

    public GatewayNotificationService(ReactiveNotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Mono<Notification> triggerNotification(NotificationRequest request) {
        Notification notification = Notification.builder()
                .recipientUserId(request.getRecipientUserId())
                .actorUserId(request.getActorUserId())
                .actorName(request.getActorName())
                .actorAvatar(request.getActorAvatar())
                .type(request.getType())
                .targetPostId(request.getTargetPostId())
                .message(request.getMessage())
                .read(false)
                .createdAt(Instant.now())
                .build();

        return notificationRepository.save(notification);
    }

    public Flux<Notification> getNotifications(String userId) {
        return notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId);
    }

    public Mono<Long> getUnreadCount(String userId) {
        return notificationRepository.countByRecipientUserIdAndReadFalse(userId);
    }

    public Mono<Notification> markAsRead(String id) {
        return notificationRepository.findById(id)
                .flatMap(notification -> {
                    notification.setRead(true);
                    return notificationRepository.save(notification);
                });
    }

    public Mono<Long> markAllAsRead(String userId) {
        return notificationRepository.findByRecipientUserIdAndReadFalse(userId)
                .flatMap(notification -> {
                    notification.setRead(true);
                    return notificationRepository.save(notification);
                })
                .count();
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seedInitialDemoNotifications() {
        notificationRepository.count()
                .filter(count -> count == 0)
                .flatMapMany(ignored -> {
                    log.info("Seeding initial demo notifications for course users into NotificationsDB...");
                    Instant now = Instant.now();

                    List<Notification> initialNotifications = List.of(
                            Notification.builder()
                                    .recipientUserId("user_hunain")
                                    .actorUserId("user_alice")
                                    .actorName("Alice Walker")
                                    .actorAvatar("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150")
                                    .type(NotificationType.LIKE)
                                    .targetPostId("post_seed_01")
                                    .message("Alice Walker liked your post: 'Deep dive into event-driven CQRS fan-out systems.'")
                                    .read(false)
                                    .createdAt(now.minus(10, ChronoUnit.MINUTES))
                                    .build(),
                            Notification.builder()
                                    .recipientUserId("user_hunain")
                                    .actorUserId("user_bob")
                                    .actorName("Bob Creator")
                                    .actorAvatar("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150")
                                    .type(NotificationType.COMMENT)
                                    .targetPostId("post_seed_01")
                                    .message("Bob Creator commented: 'Great analysis on cache invalidation!'")
                                    .read(false)
                                    .createdAt(now.minus(25, ChronoUnit.MINUTES))
                                    .build(),
                            Notification.builder()
                                    .recipientUserId("user_hunain")
                                    .actorUserId("user_charlie")
                                    .actorName("Charlie Davis")
                                    .actorAvatar("https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150")
                                    .type(NotificationType.FOLLOW)
                                    .message("Charlie Davis started following you.")
                                    .read(false)
                                    .createdAt(now.minus(1, ChronoUnit.HOURS))
                                    .build(),
                            Notification.builder()
                                    .recipientUserId("user_alice")
                                    .actorUserId("user_hunain")
                                    .actorName("Syed Muhammad Hunain")
                                    .actorAvatar("https://avatars.githubusercontent.com/u/108502392?v=4")
                                    .type(NotificationType.LIKE)
                                    .targetPostId("post_seed_02")
                                    .message("Syed Muhammad Hunain liked your system architecture post.")
                                    .read(false)
                                    .createdAt(now.minus(40, ChronoUnit.MINUTES))
                                    .build()
                    );

                    return notificationRepository.saveAll(initialNotifications);
                })
                .doOnComplete(() -> log.info("Initial notifications check completed."))
                .subscribe();
    }
}
