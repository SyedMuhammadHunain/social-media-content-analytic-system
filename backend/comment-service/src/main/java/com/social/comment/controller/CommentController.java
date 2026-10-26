package com.social.comment.controller;

import com.social.common.dto.ApiResponse;
import com.social.common.dto.CommentRequest;
import com.social.common.model.Comment;
import com.social.comment.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/comment")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Comment>> addComment(@Valid @RequestBody CommentRequest request) {
        Comment comment = commentService.addComment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(comment, "Comment posted successfully."));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<ApiResponse<List<Comment>>> getComments(@PathVariable String postId) {
        List<Comment> comments = commentService.getCommentsByPostId(postId);
        return ResponseEntity.ok(ApiResponse.success(comments, "Comments retrieved successfully."));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteComment(
            @PathVariable String commentId,
            @RequestParam String userId) {
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("commentId", commentId, "deleted", true), "Comment deleted successfully."));
    }
}
