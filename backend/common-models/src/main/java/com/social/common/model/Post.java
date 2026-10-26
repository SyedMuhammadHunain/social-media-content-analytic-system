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
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "PostsDB")
@CompoundIndex(name = "user_created_idx", def = "{'userId': 1, 'createdAt': -1}")
public class Post {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String text;

    private String mediaUrl;

    private String mediaType; // TEXT, IMAGE, VIDEO

    @Builder.Default
    private List<String> hashtags = new ArrayList<>();

    @Builder.Default
    private long likeCount = 0;

    @Builder.Default
    private long commentCount = 0;

    @Builder.Default
    private boolean deleted = false;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();
}
