package com.social.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedResponse {

    private String userId;
    private int page;
    private int size;

    @Builder.Default
    private List<FeedPostDto> posts = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeedPostDto {
        private String postId;
        private String authorId;
        private String authorName;
        private String authorAvatar;
        private String text;
        private String mediaUrl;
        private String mediaType;
        private List<String> hashtags;
        private long likeCount;
        private long commentCount;
        private boolean likedByCurrentUser;
        private Instant createdAt;
    }
}
