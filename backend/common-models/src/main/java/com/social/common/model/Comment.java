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
@Document(collection = "CommentsDB")
@CompoundIndex(name = "post_comment_created_idx", def = "{'postId': 1, 'createdAt': -1}")
public class Comment {

    @Id
    private String id;

    @Indexed
    private String postId;

    @Indexed
    private String userId;

    private String content;

    private String parentCommentId;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
