package com.social.common.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePostRequest {

    @NotBlank(message = "userId is required")
    private String userId;

    @Size(max = 2000, message = "Post text cannot exceed 2000 characters")
    private String text;

    private List<String> hashtags;
}
