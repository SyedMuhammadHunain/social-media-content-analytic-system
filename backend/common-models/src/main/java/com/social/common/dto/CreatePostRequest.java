package com.social.common.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePostRequest {

    @NotBlank(message = "userId is required")
    private String userId;

    @Size(max = 2000, message = "Post text cannot exceed 2000 characters")
    private String text;

    private String mediaUrl;

    @Builder.Default
    private String mediaType = "TEXT"; // TEXT, IMAGE, VIDEO

    @Builder.Default
    private List<String> hashtags = new ArrayList<>();
}
