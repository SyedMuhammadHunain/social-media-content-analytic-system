package com.social.postwriter.service;

import com.social.common.dto.CreatePostRequest;
import com.social.common.dto.UpdatePostRequest;
import com.social.common.event.PostCreatedEvent;
import com.social.common.exception.ResourceNotFoundException;
import com.social.common.model.Post;
import com.social.postwriter.repository.PostRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PostWriterService {

    private static final Logger log = LoggerFactory.getLogger(PostWriterService.class);
    private static final Pattern HASHTAG_PATTERN = Pattern.compile("#(\\w+)");

    private final PostRepository postRepository;
    private final RestClient restClient;

    @Value("${social.feedgen.url:http://localhost:8086}")
    private String feedGenUrl;

    public PostWriterService(PostRepository postRepository) {
        this.postRepository = postRepository;
        this.restClient = RestClient.create();
    }

    public Post createPost(CreatePostRequest request) {
        List<String> hashtags = request.getHashtags();
        if ((hashtags == null || hashtags.isEmpty()) && request.getText() != null) {
            hashtags = extractHashtags(request.getText());
        }

        String mediaType = resolveMediaType(request.getMediaType(), request.getMediaUrl());

        Post post = Post.builder()
                .userId(request.getUserId())
                .text(request.getText())
                .mediaUrl(request.getMediaUrl())
                .mediaType(mediaType)
                .hashtags(hashtags != null ? hashtags : new ArrayList<>())
                .likeCount(0)
                .commentCount(0)
                .deleted(false)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        Post savedPost = postRepository.save(post);

        // Notify newsfeed-generator-service asynchronously
        triggerFeedFanout(savedPost);

        return savedPost;
    }

    public Post getPostById(String postId) {
        return postRepository.findByIdAndDeletedFalse(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));
    }

    public Post updatePost(String postId, UpdatePostRequest request) {
        Post post = getPostById(postId);

        if (!post.getUserId().equals(request.getUserId())) {
            throw new IllegalArgumentException("User is not authorized to edit this post");
        }

        if (request.getText() != null) {
            post.setText(request.getText());
        }

        if (request.getHashtags() != null) {
            post.setHashtags(request.getHashtags());
        } else if (request.getText() != null) {
            post.setHashtags(extractHashtags(request.getText()));
        }

        post.setUpdatedAt(Instant.now());
        return postRepository.save(post);
    }

    public boolean deletePost(String postId, String userId) {
        Post post = getPostById(postId);

        if (!post.getUserId().equals(userId)) {
            throw new IllegalArgumentException("User is not authorized to delete this post");
        }

        post.setDeleted(true);
        post.setUpdatedAt(Instant.now());
        postRepository.save(post);
        return true;
    }

    private List<String> extractHashtags(String text) {
        List<String> tags = new ArrayList<>();
        Matcher matcher = HASHTAG_PATTERN.matcher(text);
        while (matcher.find()) {
            tags.add(matcher.group(1));
        }
        return tags;
    }

    private String resolveMediaType(String declaredType, String mediaUrl) {
        if (declaredType != null && !declaredType.equalsIgnoreCase("TEXT")) {
            return declaredType.toUpperCase();
        }
        if (mediaUrl != null && !mediaUrl.isBlank()) {
            String lower = mediaUrl.toLowerCase();
            if (lower.endsWith(".mp4") || lower.endsWith(".mov") || lower.endsWith(".webm")) {
                return "VIDEO";
            }
            return "IMAGE";
        }
        return "TEXT";
    }

    private void triggerFeedFanout(Post post) {
        try {
            PostCreatedEvent event = PostCreatedEvent.builder()
                    .postId(post.getId())
                    .authorId(post.getUserId())
                    .text(post.getText())
                    .mediaUrl(post.getMediaUrl())
                    .mediaType(post.getMediaType())
                    .hashtags(post.getHashtags())
                    .createdAt(post.getCreatedAt())
                    .build();

            restClient.post()
                    .uri(feedGenUrl + "/v1/feedgen/fanout")
                    .body(event)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.debug("Fanout service not reached (expected during isolated testing): {}", e.getMessage());
        }
    }
}
