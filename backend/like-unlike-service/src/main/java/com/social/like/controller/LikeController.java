package com.social.like.controller;

import com.social.common.dto.ApiResponse;
import com.social.common.dto.LikeRequest;
import com.social.common.dto.LikeResponse;
import com.social.like.service.LikeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1")
public class LikeController {

    private final LikeService likeService;

    public LikeController(LikeService likeService) {
        this.likeService = likeService;
    }

    @PostMapping("/like")
    public ResponseEntity<ApiResponse<LikeResponse>> likePost(@Valid @RequestBody LikeRequest request) {
        LikeResponse response = likeService.likePost(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Post liked successfully."));
    }

    @PostMapping("/unlike")
    public ResponseEntity<ApiResponse<LikeResponse>> unlikePost(@Valid @RequestBody LikeRequest request) {
        LikeResponse response = likeService.unlikePost(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Post unliked successfully."));
    }

    @GetMapping("/like/{postId}/status")
    public ResponseEntity<ApiResponse<LikeResponse>> getStatus(
            @PathVariable String postId,
            @RequestParam(required = false) String userId) {
        LikeResponse response = likeService.getLikeStatus(postId, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Like status retrieved successfully."));
    }
}
