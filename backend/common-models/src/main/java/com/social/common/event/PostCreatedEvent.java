package com.social.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostCreatedEvent {
    private String postId;
    private String authorId;
    private String text;
    private String mediaUrl;
    private String mediaType;
    private List<String> hashtags;
    private Instant createdAt;
}
