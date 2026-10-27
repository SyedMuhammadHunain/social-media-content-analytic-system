package com.social.common.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "NotificationsDB")
@CompoundIndex(name = "recipient_created_idx", def = "{'recipientUserId': 1, 'createdAt': -1}")
public class Notification {

    @Id
    private String id;

    @Indexed
    private String recipientUserId;

    private String actorUserId;
    private String actorName;
    private String actorAvatar;

    private NotificationType type;

    private String targetPostId;
    private String message;

    @Builder.Default
    private boolean read = false;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
