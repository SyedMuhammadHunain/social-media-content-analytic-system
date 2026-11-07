package com.social.common.dto;

import com.social.common.model.ChatMediaItem;
import jakarta.validation.constraints.NotBlank;
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

    @NotBlank(message = "recipientId is required")
    private String recipientId;

    private String conversationId;

    private String text;

    private List<ChatMediaItem> media;
}
