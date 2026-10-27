package com.social.like.controller;

import com.social.common.dto.ApiResponse;
import com.social.common.dto.LikeRequest;
import com.social.common.dto.LikeResponse;
import com.social.like.service.LikeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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

    @RequestMapping(value = "/unlike", method = {RequestMethod.POST, RequestMethod.DELETE})
    public ResponseEntity<ApiResponse<LikeResponse>> unlikePost(
            @RequestBody(required = false) LikeRequest request,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String postId) {
        LikeRequest resolved = resolveRequest(request, userId, postId);
        LikeResponse response = likeService.unlikePost(resolved);
        return ResponseEntity.ok(ApiResponse.success(response, "Post unliked successfully."));
    }

    @GetMapping("/like/{postId}/status")
    public ResponseEntity<ApiResponse<LikeResponse>> getStatus(
            @PathVariable String postId,
            @RequestParam(required = false) String userId) {
        LikeResponse response = likeService.getLikeStatus(postId, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Like status retrieved successfully."));
    }

    private LikeRequest resolveRequest(LikeRequest request, String userId, String postId) {
        String finalUserId = firstNonBlank(request != null ? request.getUserId() : null, userId);
        String finalPostId = firstNonBlank(request != null ? request.getPostId() : null, postId);
        if (finalUserId.isEmpty() || finalPostId.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId and postId are required");
        }
        return LikeRequest.builder().userId(finalUserId).postId(finalPostId).build();
    }

    private String firstNonBlank(String primary, String fallback) {
        if (primary != null && !primary.isBlank()) {
            return primary.trim();
        }
        return (fallback != null) ? fallback.trim() : "";
    }
}
