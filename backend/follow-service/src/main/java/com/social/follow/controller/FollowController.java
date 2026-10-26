package com.social.follow.controller;

import com.social.common.dto.ApiResponse;
import com.social.common.dto.FollowRequest;
import com.social.common.dto.FollowResponse;
import com.social.follow.service.FollowService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1")
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    @PostMapping("/follow")
    public ResponseEntity<ApiResponse<FollowResponse>> followUser(@Valid @RequestBody FollowRequest request) {
        FollowResponse response = followService.followUser(request);
        return ResponseEntity.ok(ApiResponse.success(response, "User followed successfully."));
    }

    @PostMapping("/unfollow")
    public ResponseEntity<ApiResponse<FollowResponse>> unfollowUser(@Valid @RequestBody FollowRequest request) {
        FollowResponse response = followService.unfollowUser(request);
        return ResponseEntity.ok(ApiResponse.success(response, "User unfollowed successfully."));
    }

    @GetMapping("/follow/{userId}/followers")
    public ResponseEntity<ApiResponse<List<String>>> getFollowers(@PathVariable String userId) {
        List<String> followers = followService.getFollowerIds(userId);
        return ResponseEntity.ok(ApiResponse.success(followers, "Followers retrieved successfully."));
    }

    @GetMapping("/follow/{userId}/following")
    public ResponseEntity<ApiResponse<List<String>>> getFollowing(@PathVariable String userId) {
        List<String> following = followService.getFollowingIds(userId);
        return ResponseEntity.ok(ApiResponse.success(following, "Following retrieved successfully."));
    }

    @GetMapping("/follow/status")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkStatus(
            @RequestParam String followerId,
            @RequestParam String followingId) {
        boolean isFollowing = followService.isFollowing(followerId, followingId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("isFollowing", isFollowing), "Status retrieved."));
    }
}
