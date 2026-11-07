package com.social.gateway.controller;

import com.social.common.dto.ApiResponse;
import com.social.common.dto.ChatConversationSummary;
import com.social.common.dto.SendMessageRequest;
import com.social.common.model.ChatMessage;
import com.social.gateway.security.JwtTokenProvider;
import com.social.gateway.service.GatewayChatMessageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/v1/chat")
public class ChatMessageController {

    private final GatewayChatMessageService chatMessageService;
    private final JwtTokenProvider jwtTokenProvider;

    public ChatMessageController(
            GatewayChatMessageService chatMessageService,
            JwtTokenProvider jwtTokenProvider) {
        this.chatMessageService = chatMessageService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    private String resolveUserId(String headerUserId, String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            if (jwtTokenProvider.validateToken(token)) {
                String extracted = jwtTokenProvider.extractUserId(token);
                if (extracted != null && !extracted.isBlank()) {
                    return extracted;
                }
            }
        }
        if (headerUserId != null && !headerUserId.isBlank()) {
            return headerUserId.trim();
        }
        return "usr_me_01";
    }

    @PostMapping("/messages")
    public Mono<ResponseEntity<ApiResponse<ChatMessage>>> sendMessage(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
            @Valid @RequestBody SendMessageRequest request) {

        String senderId = resolveUserId(headerUserId, authHeader);
        return chatMessageService.sendMessage(senderId, request)
                .map(msg -> ResponseEntity.status(HttpStatus.CREATED)
                        .body(ApiResponse.success(msg, "Message sent successfully.")));
    }

    @GetMapping("/messages")
    public Mono<ResponseEntity<ApiResponse<List<ChatMessage>>>> getConversationMessages(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
            @RequestParam("with") String withUserId) {

        String currentUserId = resolveUserId(headerUserId, authHeader);
        return chatMessageService.getConversationMessages(currentUserId, withUserId)
                .collectList()
                .map(list -> ResponseEntity.ok(ApiResponse.success(list, "Messages retrieved successfully.")));
    }

    @GetMapping("/conversations")
    public Mono<ResponseEntity<ApiResponse<List<ChatConversationSummary>>>> getConversations(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {

        String currentUserId = resolveUserId(headerUserId, authHeader);
        return chatMessageService.getConversations(currentUserId)
                .collectList()
                .map(list -> ResponseEntity.ok(ApiResponse.success(list, "Conversations retrieved successfully.")));
    }

    @PutMapping("/conversations/{conversationId}/read")
    public Mono<ResponseEntity<ApiResponse<Void>>> markConversationAsRead(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
            @PathVariable String conversationId) {

        String currentUserId = resolveUserId(headerUserId, authHeader);
        return chatMessageService.markConversationAsRead(conversationId, currentUserId)
                .thenReturn(ResponseEntity.ok(ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .message("Conversation marked as read.")
                        .build()));
    }
}
