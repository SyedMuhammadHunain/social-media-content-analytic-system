package com.social.common.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "chat_messages")
@CompoundIndexes({
    @CompoundIndex(name = "convo_created_idx", def = "{'conversationId': 1, 'createdAt': 1}"),
    @CompoundIndex(name = "recipient_read_idx", def = "{'recipientId': 1, 'read': 1}"),
    @CompoundIndex(name = "sender_created_idx", def = "{'senderId': 1, 'createdAt': -1}"),
    @CompoundIndex(name = "recipient_created_idx", def = "{'recipientId': 1, 'createdAt': -1}")
})
public class ChatMessage {

    @Id
    private String id;

    @Indexed
    private String conversationId;

    @Indexed
    private String senderId;

    @Indexed
    private String recipientId;

    private String text;

    private List<ChatMediaItem> media;

    @Builder.Default
    private boolean read = false;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
