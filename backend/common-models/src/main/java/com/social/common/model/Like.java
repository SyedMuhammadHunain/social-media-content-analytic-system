package com.social.common.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "LikesDB")
@CompoundIndex(name = "user_post_unique_idx", def = "{'userId': 1, 'postId': 1}", unique = true)
public class Like {

    @Id
    private String id;

    private String userId;

    private String postId;

    @Builder.Default
    private Instant likedAt = Instant.now();
}
