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
public class FollowRequest {

    @NotBlank(message = "followerId is required")
    private String followerId;

    @NotBlank(message = "followingId is required")
    private String followingId;
}
