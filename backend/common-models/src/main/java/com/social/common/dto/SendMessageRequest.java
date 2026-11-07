package com.social.common.dto;

import com.social.common.model.ChatMediaItem;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {

    private String clientMessageId;

    @NotBlank(message = "recipientId is required")
    private String recipientId;

    private String conversationId;

    @Size(max = 4000, message = "Message text cannot exceed 4000 characters")
    private String text;

    @Size(max = 10, message = "Maximum 10 attachments allowed per message")
    private List<ChatMediaItem> media;

    @AssertTrue(message = "Message must have text or media")
    public boolean isHasContent() {
        return (text != null && !text.isBlank()) || (media != null && !media.isEmpty());
    }
}
