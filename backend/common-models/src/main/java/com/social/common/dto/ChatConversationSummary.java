package com.social.common.dto;

import com.social.common.model.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatConversationSummary {
    private String conversationId;
    private String partnerId;
    private String partnerUsername;
    private String partnerName;
    private String partnerAvatar;
    private ChatMessage lastMessage;
    private int unreadCount;
    private Instant updatedAt;
}
