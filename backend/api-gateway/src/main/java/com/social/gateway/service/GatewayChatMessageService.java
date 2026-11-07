package com.social.gateway.service;

import com.social.common.dto.ChatConversationSummary;
import com.social.common.dto.SendMessageRequest;
import com.social.common.model.ChatMessage;
import com.social.common.model.User;
import com.social.gateway.repository.ReactiveChatMessageRepository;
import com.social.gateway.repository.ReactiveUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.*;

@Service
public class GatewayChatMessageService {

    private static final Logger log = LoggerFactory.getLogger(GatewayChatMessageService.class);

    private final ReactiveChatMessageRepository chatMessageRepository;
    private final ReactiveUserRepository userRepository;

    public GatewayChatMessageService(
            ReactiveChatMessageRepository chatMessageRepository,
            ReactiveUserRepository userRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
    }

    /**
     * Compute a deterministic conversation ID for any pair of users.
     * Both sender and receiver will always resolve the exact same ID.
     */
    public String generateConversationId(String userA, String userB) {
        String a = Objects.toString(userA, "").trim();
        String b = Objects.toString(userB, "").trim();
        return a.compareTo(b) <= 0 ? "conv_" + a + "_" + b : "conv_" + b + "_" + a;
    }

    /**
     * Save a new direct message between users.
     */
    public Mono<ChatMessage> sendMessage(String senderId, SendMessageRequest request) {
        String effectiveSenderId = (senderId != null && !senderId.isBlank()) ? senderId : "usr_me_01";
        String conversationId = generateConversationId(effectiveSenderId, request.getRecipientId());

        ChatMessage message = ChatMessage.builder()
                .id("msg_" + UUID.randomUUID().toString())
                .conversationId(conversationId)
                .senderId(effectiveSenderId)
                .recipientId(request.getRecipientId())
                .text(request.getText())
                .media(request.getMedia())
                .read(false)
                .createdAt(Instant.now())
                .build();

        log.debug("Persisting direct message: id={}, convo={}, sender={}, recipient={}",
                message.getId(), conversationId, effectiveSenderId, request.getRecipientId());

        return chatMessageRepository.save(message);
    }

    /**
     * Retrieve all chronological messages in the conversation between two users.
     */
    public Flux<ChatMessage> getConversationMessages(String userA, String userB) {
        String conversationId = generateConversationId(userA, userB);
        return chatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    /**
     * Mark all incoming messages in a conversation as read.
     */
    public Mono<Void> markConversationAsRead(String conversationId, String recipientId) {
        return chatMessageRepository.findByConversationIdAndRecipientIdAndReadFalse(conversationId, recipientId)
                .flatMap(msg -> {
                    msg.setRead(true);
                    return chatMessageRepository.save(msg);
                })
                .then();
    }

    /**
     * Retrieve conversation summaries for a user with the latest message and unread count.
     */
    public Flux<ChatConversationSummary> getConversations(String userId) {
        return chatMessageRepository.findBySenderIdOrRecipientIdOrderByCreatedAtDesc(userId, userId)
                .collectList()
                .flatMapMany(messages -> {
                    // Group by conversationId preserving latest message order
                    Map<String, ChatMessage> latestMessages = new LinkedHashMap<>();
                    for (ChatMessage msg : messages) {
                        if (!latestMessages.containsKey(msg.getConversationId())) {
                            latestMessages.put(msg.getConversationId(), msg);
                        }
                    }

                    return Flux.fromIterable(latestMessages.values())
                            .concatMap(latest -> {
                                String convId = latest.getConversationId();
                                String partnerId = latest.getSenderId().equals(userId)
                                        ? latest.getRecipientId()
                                        : latest.getSenderId();

                                return chatMessageRepository
                                        .countByConversationIdAndRecipientIdAndReadFalse(convId, userId)
                                        .flatMap(unreadCount -> userRepository.findById(partnerId)
                                                .defaultIfEmpty(User.builder()
                                                        .id(partnerId)
                                                        .username(partnerId)
                                                        .fullName(partnerId)
                                                        .build())
                                                .map(partner -> ChatConversationSummary.builder()
                                                        .conversationId(convId)
                                                        .partnerId(partner.getId())
                                                        .partnerUsername(partner.getUsername())
                                                        .partnerName(partner.getFullName())
                                                        .partnerAvatar(partner.getAvatarUrl())
                                                        .lastMessage(latest)
                                                        .unreadCount(unreadCount.intValue())
                                                        .updatedAt(latest.getCreatedAt())
                                                        .build()));
                            });
                });
    }
}
