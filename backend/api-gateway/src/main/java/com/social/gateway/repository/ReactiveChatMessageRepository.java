package com.social.gateway.repository;

import com.social.common.model.ChatMessage;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface ReactiveChatMessageRepository extends ReactiveMongoRepository<ChatMessage, String> {

    Flux<ChatMessage> findByConversationIdOrderByCreatedAtAsc(String conversationId);

    Flux<ChatMessage> findBySenderIdOrRecipientIdOrderByCreatedAtDesc(String senderId, String recipientId);

    Mono<Long> countByRecipientIdAndReadFalse(String recipientId);

    Mono<Long> countByConversationIdAndRecipientIdAndReadFalse(String conversationId, String recipientId);

    Flux<ChatMessage> findByConversationIdAndRecipientIdAndReadFalse(String conversationId, String recipientId);
}
