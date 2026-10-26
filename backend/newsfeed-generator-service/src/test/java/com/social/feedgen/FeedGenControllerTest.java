package com.social.feedgen;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.social.common.event.PostCreatedEvent;
import com.social.feedgen.controller.FeedGenController;
import com.social.feedgen.service.FeedFanoutService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(FeedGenController.class)
class FeedGenControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private FeedFanoutService fanoutService;

    @Test
    void testProcessFanoutEndpoint() throws Exception {
        PostCreatedEvent event = PostCreatedEvent.builder()
                .postId("post_100")
                .authorId("user_1")
                .text("Fanout test message")
                .createdAt(Instant.now())
                .build();

        when(fanoutService.fanoutPost(any(PostCreatedEvent.class))).thenReturn(5);

        mockMvc.perform(post("/v1/feedgen/fanout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(event)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.postId").value("post_100"))
                .andExpect(jsonPath("$.data.recipientsDelivered").value(5));
    }
}
