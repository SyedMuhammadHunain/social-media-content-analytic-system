package com.social.feedreader.repository;

import com.social.common.model.FeedItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedItemReaderRepository extends MongoRepository<FeedItem, String> {

    Page<FeedItem> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
}
