package com.social.gateway.service;

import com.social.common.dto.ChatConversationSummary;
import com.social.common.dto.SendMessageRequest;
import com.social.common.model.ChatMessage;
import com.social.common.model.Notification;
import com.social.common.model.NotificationType;
import com.social.common.model.User;
import com.social.gateway.repository.ReactiveChatMessageRepository;
import com.social.gateway.repository.ReactiveNotificationRepository;
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
    private final ReactiveNotificationRepository notificationRepository;

    public GatewayChatMessageService(
            ReactiveChatMessageRepository chatMessageRepository,
            ReactiveUserRepository userRepository,
            ReactiveNotificationRepository notificationRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
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
     * Save a new direct message between users and notify recipient.
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

        return chatMessageRepository.save(message)
                .flatMap(savedMsg -> userRepository.findById(effectiveSenderId)
                        .map(sender -> {
                            String actorName = (sender.getFullName() != null && !sender.getFullName().isBlank())
                                    ? sender.getFullName()
                                    : (sender.getUsername() != null ? sender.getUsername() : effectiveSenderId);
                            return createMessageNotification(effectiveSenderId, actorName, sender.getAvatarUrl(), savedMsg);
                        })
                        .defaultIfEmpty(createMessageNotification(effectiveSenderId, effectiveSenderId, null, savedMsg))
                        .flatMap(notificationRepository::save)
                        .onErrorResume(e -> {
                            log.warn("Failed to create message notification: {}", e.getMessage());
                            return Mono.empty();
                        })
                        .thenReturn(savedMsg));
    }

    private Notification createMessageNotification(String senderId, String senderName, String avatarUrl, ChatMessage msg) {
        String snippet = msg.getText();
        if (snippet != null && snippet.length() > 60) {
            snippet = snippet.substring(0, 57) + "...";
        } else if (snippet == null || snippet.isBlank()) {
            snippet = (msg.getMedia() != null && !msg.getMedia().isEmpty()) ? "Sent an attachment" : "Sent a message";
        }

        return Notification.builder()
                .id("notif_" + UUID.randomUUID())
                .recipientUserId(msg.getRecipientId())
                .actorUserId(senderId)
                .actorName(senderName)
                .actorAvatar(avatarUrl)
                .type(NotificationType.MESSAGE)
                .targetPostId(msg.getConversationId())
                .message(senderName + ": " + snippet)
                .read(false)
                .createdAt(Instant.now())
                .build();
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
