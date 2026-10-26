package com.social.feedgen.service;

import com.social.common.dto.ApiResponse;
import com.social.common.event.PostCreatedEvent;
import com.social.common.model.FeedItem;
import com.social.feedgen.repository.FeedItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
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
    private final RestClient restClient;

    @Value("${social.follow-service.url:http://localhost:8084}")
    private String followServiceUrl;

    public FeedFanoutService(FeedItemRepository feedItemRepository) {
        this.feedItemRepository = feedItemRepository;
        this.restClient = RestClient.create();
    }

    public int fanoutPost(PostCreatedEvent event) {
        Instant start = Instant.now();
        Set<String> recipients = new HashSet<>();

        // Author always receives their own post in their personal feed
        recipients.add(event.getAuthorId());

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
