package com.social.follow.repository;

import com.social.common.model.Follow;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FollowRepository extends MongoRepository<Follow, String> {

    boolean existsByFollowerIdAndFollowingId(String followerId, String followingId);

    void deleteByFollowerIdAndFollowingId(String followerId, String followingId);

    List<Follow> findByFollowingId(String followingId);

    List<Follow> findByFollowerId(String followerId);

    long countByFollowingId(String followingId);

    long countByFollowerId(String followerId);
}
