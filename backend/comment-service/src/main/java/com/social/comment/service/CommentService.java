package com.social.comment.service;

import com.social.common.dto.CommentRequest;
import com.social.common.exception.ResourceNotFoundException;
import com.social.common.model.Comment;
import com.social.common.model.Post;
import com.social.comment.repository.CommentRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final MongoTemplate mongoTemplate;

    public CommentService(CommentRepository commentRepository, MongoTemplate mongoTemplate) {
        this.commentRepository = commentRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public Comment addComment(CommentRequest request) {
        Comment comment = Comment.builder()
                .userId(request.getUserId())
                .postId(request.getPostId())
                .content(request.getContent())
                .parentCommentId(request.getParentCommentId())
                .createdAt(Instant.now())
                .build();

        Comment saved = commentRepository.save(comment);

        // Atomically increment post comment counter in PostsDB
        Query query = new Query(Criteria.where("id").is(request.getPostId()));
        Update update = new Update().inc("commentCount", 1);
        mongoTemplate.updateFirst(query, update, Post.class);

        return saved;
    }

    public List<Comment> getCommentsByPostId(String postId) {
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId);
    }

    public boolean deleteComment(String commentId, String userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        if (!comment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("User is not authorized to delete this comment");
        }

        commentRepository.deleteById(commentId);

        // Atomically decrement post comment counter in PostsDB
        Query query = new Query(Criteria.where("id").is(comment.getPostId()).and("commentCount").gt(0));
        Update update = new Update().inc("commentCount", -1);
        mongoTemplate.updateFirst(query, update, Post.class);

        return true;
    }
}
