package com.social.feedreader.controller;

import com.social.common.dto.ApiResponse;
import com.social.common.dto.FeedResponse;
import com.social.feedreader.service.FeedReaderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/feeds")
public class FeedReaderController {

    private final FeedReaderService feedReaderService;

    public FeedReaderController(FeedReaderService feedReaderService) {
        this.feedReaderService = feedReaderService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<FeedResponse>> getFeed(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        FeedResponse feed = feedReaderService.getFeedForUser(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(feed, "Feed fetched successfully."));
    }
}
