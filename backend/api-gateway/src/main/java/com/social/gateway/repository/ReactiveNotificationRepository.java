package com.social.gateway.repository;

import com.social.common.model.Notification;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface ReactiveNotificationRepository extends ReactiveMongoRepository<Notification, String> {

    Flux<Notification> findByRecipientUserIdOrderByCreatedAtDesc(String recipientUserId);

    Mono<Long> countByRecipientUserIdAndReadFalse(String recipientUserId);

    Flux<Notification> findByRecipientUserIdAndReadFalse(String recipientUserId);
}
