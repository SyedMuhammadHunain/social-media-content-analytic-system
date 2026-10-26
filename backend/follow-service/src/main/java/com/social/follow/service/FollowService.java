package com.social.follow.service;

import com.social.common.dto.FollowRequest;
import com.social.common.dto.FollowResponse;
import com.social.common.model.Follow;
import com.social.follow.repository.FollowRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class FollowService {

    private final FollowRepository followRepository;

    public FollowService(FollowRepository followRepository) {
        this.followRepository = followRepository;
    }

    public FollowResponse followUser(FollowRequest request) {
        if (request.getFollowerId().equals(request.getFollowingId())) {
            throw new IllegalArgumentException("Users cannot follow themselves");
        }

        boolean alreadyFollowing = followRepository.existsByFollowerIdAndFollowingId(
                request.getFollowerId(), request.getFollowingId());

        if (!alreadyFollowing) {
            Follow follow = Follow.builder()
                    .followerId(request.getFollowerId())
                    .followingId(request.getFollowingId())
                    .followedAt(Instant.now())
                    .build();
            followRepository.save(follow);
        }

        return FollowResponse.builder()
                .followerId(request.getFollowerId())
                .followingId(request.getFollowingId())
                .isFollowing(true)
                .build();
    }

    public FollowResponse unfollowUser(FollowRequest request) {
        followRepository.deleteByFollowerIdAndFollowingId(request.getFollowerId(), request.getFollowingId());

        return FollowResponse.builder()
                .followerId(request.getFollowerId())
                .followingId(request.getFollowingId())
                .isFollowing(false)
                .build();
    }

    public List<String> getFollowerIds(String userId) {
        return followRepository.findByFollowingId(userId).stream()
                .map(Follow::getFollowerId)
                .toList();
    }

    public List<String> getFollowingIds(String userId) {
        return followRepository.findByFollowerId(userId).stream()
                .map(Follow::getFollowingId)
                .toList();
    }

    public boolean isFollowing(String followerId, String followingId) {
        return followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }
}
