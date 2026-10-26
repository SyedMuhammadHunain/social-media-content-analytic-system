package com.social.feedgen.controller;

import com.social.common.dto.ApiResponse;
import com.social.common.event.PostCreatedEvent;
import com.social.feedgen.service.FeedFanoutService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/v1/feedgen")
public class FeedGenController {

    private final FeedFanoutService fanoutService;

    public FeedGenController(FeedFanoutService fanoutService) {
        this.fanoutService = fanoutService;
    }

    @PostMapping("/fanout")
    public ResponseEntity<ApiResponse<Map<String, Object>>> processFanout(@RequestBody PostCreatedEvent event) {
        int delivered = fanoutService.fanoutPost(event);
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("postId", event.getPostId(), "recipientsDelivered", delivered),
                "Fan-out processed successfully."
        ));
    }
}
