package com.social.postwriter.controller;

import com.social.common.dto.ApiResponse;
import com.social.common.dto.CreatePostRequest;
import com.social.common.dto.UpdatePostRequest;
import com.social.common.model.Post;
import com.social.postwriter.service.PostWriterService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/v1/posts")
public class PostWriterController {

    private final PostWriterService postWriterService;

    public PostWriterController(PostWriterService postWriterService) {
        this.postWriterService = postWriterService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Post>> createPost(@Valid @RequestBody CreatePostRequest request) {
        Post created = postWriterService.createPost(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Post created successfully."));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<ApiResponse<Post>> getPost(@PathVariable String postId) {
        Post post = postWriterService.getPostById(postId);
        return ResponseEntity.ok(ApiResponse.success(post, "Post retrieved successfully."));
    }

    @PutMapping("/{postId}")
    public ResponseEntity<ApiResponse<Post>> updatePost(
            @PathVariable String postId,
            @Valid @RequestBody UpdatePostRequest request) {
        Post updated = postWriterService.updatePost(postId, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Post updated successfully."));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deletePost(
            @PathVariable String postId,
            @RequestParam String userId) {
        postWriterService.deletePost(postId, userId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("postId", postId, "deleted", true), "Post deleted successfully."));
    }
}
