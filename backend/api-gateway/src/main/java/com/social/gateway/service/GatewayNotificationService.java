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
        return notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId)
                .collectList()
                .flatMapMany(existing -> {
                    if (existing.isEmpty()) {
                        log.info("Generating initial dynamic notifications for user: {}", userId);
                        return generateDynamicNotificationsForUser(userId);
                    }
                    return Flux.fromIterable(existing);
                });
    }

    public Mono<Long> getUnreadCount(String userId) {
        return notificationRepository.countByRecipientUserIdAndReadFalse(userId)
                .flatMap(unread -> {
                    if (unread == 0) {
                        return notificationRepository.countByRecipientUserId(userId)
                                .flatMap(total -> {
                                    if (total == 0) {
                                        return generateDynamicNotificationsForUser(userId)
                                                .filter(n -> !n.isRead())
                                                .count();
                                    }
                                    return Mono.just(0L);
                                });
                    }
                    return Mono.just(unread);
                });
    }

    record CandidateActor(String id, String name, String avatar) {}

    private static final List<CandidateActor> CANDIDATE_ACTORS = List.of(
            new CandidateActor("user_hunain", "Syed Muhammad Hunain", "https://avatars.githubusercontent.com/u/108502392?v=4"),
            new CandidateActor("user_afzal", "Afzal Khan (Verified Lead)", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"),
            new CandidateActor("user_alice", "Alice Walker", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"),
            new CandidateActor("user_bob", "Bob Creator", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"),
            new CandidateActor("user_charlie", "Charlie Davis", "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150")
    );

    private boolean isSelf(CandidateActor actor, String userId) {
        if (userId == null) return false;
        String rawUid = userId.trim().toLowerCase();
        String cleanUid = rawUid.replaceFirst("^(user_|usr_)", "");
        String rawAid = actor.id().trim().toLowerCase();
        String cleanAid = rawAid.replaceFirst("^(user_|usr_)", "");
        return rawAid.equals(rawUid) || cleanAid.equals(cleanUid) || rawUid.contains(cleanAid) || cleanAid.contains(cleanUid);
    }

    public Flux<Notification> generateDynamicNotificationsForUser(String userId) {
        Instant now = Instant.now();
        List<CandidateActor> filtered = CANDIDATE_ACTORS.stream()
                .filter(a -> !isSelf(a, userId))
                .toList();

        CandidateActor a1 = !filtered.isEmpty() ? filtered.get(0) : new CandidateActor("user_dev_lead", "Dev Lead", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150");
        CandidateActor a2 = filtered.size() > 1 ? filtered.get(1) : a1;
        CandidateActor a3 = filtered.size() > 2 ? filtered.get(2) : a1;
        CandidateActor a4 = filtered.size() > 3 ? filtered.get(3) : a2;

        List<Notification> dynamicAlerts = List.of(
                Notification.builder()
                        .recipientUserId(userId)
                        .actorUserId(a1.id())
                        .actorName(a1.name())
                        .actorAvatar(a1.avatar())
                        .type(NotificationType.LIKE)
                        .targetPostId("post_dynamic_1")
                        .message(a1.name() + " liked your latest post: 'Building scalable microservices with Meta Astryx.'")
                        .read(false)
                        .createdAt(now.minus(6, ChronoUnit.MINUTES))
                        .build(),
                Notification.builder()
                        .recipientUserId(userId)
                        .actorUserId(a2.id())
                        .actorName(a2.name())
                        .actorAvatar(a2.avatar())
                        .type(NotificationType.COMMENT)
                        .targetPostId("post_dynamic_1")
                        .message(a2.name() + " commented: 'Excellent architecture and distributed system insights!'")
                        .read(false)
                        .createdAt(now.minus(22, ChronoUnit.MINUTES))
                        .build(),
                Notification.builder()
                        .recipientUserId(userId)
                        .actorUserId(a3.id())
                        .actorName(a3.name())
                        .actorAvatar(a3.avatar())
                        .type(NotificationType.FOLLOW)
                        .message(a3.name() + " started following you.")
                        .read(false)
                        .createdAt(now.minus(55, ChronoUnit.MINUTES))
                        .build(),
                Notification.builder()
                        .recipientUserId(userId)
                        .actorUserId(a4.id())
                        .actorName(a4.name())
                        .actorAvatar(a4.avatar())
                        .type(NotificationType.LIKE)
                        .targetPostId("post_dynamic_2")
                        .message(a4.name() + " liked your post: 'High-Throughput Analytics & Real-Time Feed.'")
                        .read(true)
                        .createdAt(now.minus(2, ChronoUnit.HOURS))
                        .build()
        );

        return notificationRepository.saveAll(dynamicAlerts);
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
