package com.social.common.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentRequest {

    @NotBlank(message = "userId is required")
    private String userId;

    @NotBlank(message = "postId is required")
    private String postId;

    @NotBlank(message = "content is required")
    @Size(max = 1000, message = "Comment content cannot exceed 1000 characters")
    private String content;

    private String parentCommentId;
}
