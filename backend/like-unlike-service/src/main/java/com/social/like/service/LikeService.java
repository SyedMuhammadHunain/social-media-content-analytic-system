package com.social.like.service;

import com.social.common.dto.LikeRequest;
import com.social.common.dto.LikeResponse;
import com.social.common.model.Like;
import com.social.common.model.Post;
import com.social.like.repository.LikeRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class LikeService {

    private final LikeRepository likeRepository;
    private final MongoTemplate mongoTemplate;

    public LikeService(LikeRepository likeRepository, MongoTemplate mongoTemplate) {
        this.likeRepository = likeRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public LikeResponse likePost(LikeRequest request) {
        boolean alreadyLiked = likeRepository.existsByUserIdAndPostId(request.getUserId(), request.getPostId());

        if (!alreadyLiked) {
            Like like = Like.builder()
                    .userId(request.getUserId())
                    .postId(request.getPostId())
                    .likedAt(Instant.now())
                    .build();
            likeRepository.save(like);
            adjustPostLikeCount(request.getPostId(), 1);
        }

        long totalLikes = likeRepository.countByPostId(request.getPostId());
        return LikeResponse.builder()
                .postId(request.getPostId())
                .liked(true)
                .totalLikes(totalLikes)
                .build();
    }

    public LikeResponse unlikePost(LikeRequest request) {
        boolean wasLiked = likeRepository.existsByUserIdAndPostId(request.getUserId(), request.getPostId());

        if (wasLiked) {
            likeRepository.deleteByUserIdAndPostId(request.getUserId(), request.getPostId());
            adjustPostLikeCount(request.getPostId(), -1);
        }

        long totalLikes = likeRepository.countByPostId(request.getPostId());
        return LikeResponse.builder()
                .postId(request.getPostId())
                .liked(false)
                .totalLikes(totalLikes)
                .build();
    }

    private void adjustPostLikeCount(String postId, int delta) {
        Query query = new Query(Criteria.where("id").is(postId));
        if (delta < 0) {
            query.addCriteria(Criteria.where("likeCount").gt(0));
        }
        Update update = new Update().inc("likeCount", delta);
        mongoTemplate.updateFirst(query, update, Post.class);
    }

    public LikeResponse getLikeStatus(String postId, String userId) {
        boolean liked = userId != null && likeRepository.existsByUserIdAndPostId(userId, postId);
        long totalLikes = likeRepository.countByPostId(postId);

        return LikeResponse.builder()
                .postId(postId)
                .liked(liked)
                .totalLikes(totalLikes)
                .build();
    }
}
