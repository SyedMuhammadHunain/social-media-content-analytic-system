package com.social.feedgen.repository;

import com.social.common.model.FeedItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedItemRepository extends MongoRepository<FeedItem, String> {

    List<FeedItem> findByUserIdOrderByCreatedAtDesc(String userId);

    boolean existsByUserIdAndPostId(String userId, String postId);
}
