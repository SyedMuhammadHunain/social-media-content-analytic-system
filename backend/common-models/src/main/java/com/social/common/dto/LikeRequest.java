package com.social.common.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LikeRequest {

    @NotBlank(message = "userId is required")
    private String userId;

    @NotBlank(message = "postId is required")
    private String postId;
}
