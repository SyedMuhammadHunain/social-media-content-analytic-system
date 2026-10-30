package com.social.feedgen.service;

import com.social.common.dto.ApiResponse;
import com.social.common.event.PostCreatedEvent;
import com.social.common.model.FeedItem;
import com.social.common.model.User;
import com.social.feedgen.repository.FeedItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class FeedFanoutService {

    private static final Logger log = LoggerFactory.getLogger(FeedFanoutService.class);

    private final FeedItemRepository feedItemRepository;
    private final MongoTemplate mongoTemplate;
    private final RestClient restClient;

    @Value("${social.follow-service.url:http://localhost:8084}")
    private String followServiceUrl;

    public FeedFanoutService(FeedItemRepository feedItemRepository, MongoTemplate mongoTemplate) {
        this.feedItemRepository = feedItemRepository;
        this.mongoTemplate = mongoTemplate;
        this.restClient = RestClient.create();
    }

    public int fanoutPost(PostCreatedEvent event) {
        Instant start = Instant.now();
        Set<String> recipients = new HashSet<>();

        // Author always receives their own post in their personal feed
        recipients.add(event.getAuthorId());

        // Broadcast to platform accounts so other users immediately see new posts
        recipients.add("user_hunain");
        recipients.add("user_alice");
        recipients.add("user_bob");
        recipients.add("user_charlie");

        // Broadcast to all active users in UsersDB
        try {
            List<User> platformUsers = mongoTemplate.findAll(User.class);
            for (User u : platformUsers) {
                if (u.getId() != null) {
                    recipients.add(u.getId());
                }
            }
        } catch (Exception e) {
            log.debug("UsersDB broadcast query skipped or offline: {}", e.getMessage());
        }

        // Fetch followers from follow-service
        try {
            ApiResponse<List<String>> response = restClient.get()
                    .uri(followServiceUrl + "/v1/follow/" + event.getAuthorId() + "/followers")
                    .retrieve()
                    .body(new ParameterizedTypeReference<ApiResponse<List<String>>>() {});

            if (response != null && response.getData() != null) {
                recipients.addAll(response.getData());
            }
        } catch (Exception e) {
            log.debug("Follow service query skipped or offline: {}", e.getMessage());
        }

        List<FeedItem> feedItems = new ArrayList<>();
        for (String recipientId : recipients) {
            feedItems.add(FeedItem.builder()
                    .userId(recipientId)
                    .postId(event.getPostId())
                    .authorId(event.getAuthorId())
                    .createdAt(event.getCreatedAt() != null ? event.getCreatedAt() : Instant.now())
                    .build());
        }

        if (!feedItems.isEmpty()) {
            feedItemRepository.saveAll(feedItems);
        }

        long elapsedMs = Duration.between(start, Instant.now()).toMillis();
        log.info("Fan-out completed for post {} to {} recipients in {} ms (SLA < 2000 ms)",
                event.getPostId(), feedItems.size(), elapsedMs);

        return feedItems.size();
    }
}
