package com.social.gateway.controller;

import com.social.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/v1/gateway")
public class GatewayStatusController {

    @GetMapping("/status")
    public Mono<ResponseEntity<ApiResponse<Map<String, Object>>>> getStatus() {
        Map<String, Object> statusData = Map.of(
                "service", "api-gateway",
                "port", 8080,
                "status", "UP",
                "routes", Map.of(
                        "posts", "/v1/posts/** -> :8081",
                        "media", "/v1/media/** -> :8082",
                        "like", "/v1/like/**, /v1/unlike/** -> :8083",
                        "follow", "/v1/follow/**, /v1/unfollow/** -> :8084",
                        "comment", "/v1/comment/** -> :8085",
                        "feeds", "/v1/feeds/** -> :8087"
                )
        );

        return Mono.just(ResponseEntity.ok(ApiResponse.success(statusData, "API Gateway is active")));
    }
}
