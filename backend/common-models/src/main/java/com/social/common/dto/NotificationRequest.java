package com.social.common.dto;

import com.social.common.model.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {

    @NotBlank(message = "recipientUserId is required")
    private String recipientUserId;

    @NotBlank(message = "actorUserId is required")
    private String actorUserId;

    private String actorName;
    private String actorAvatar;

    @NotNull(message = "type is required")
    private NotificationType type;

    private String targetPostId;

    @NotBlank(message = "message is required")
    private String message;
}
