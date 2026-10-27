package com.social.like;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.social.common.dto.LikeRequest;
import com.social.common.dto.LikeResponse;
import com.social.like.controller.LikeController;
import com.social.like.service.LikeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LikeController.class)
class LikeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private LikeService likeService;

    @Test
    void testLikePostEndpoint() throws Exception {
        LikeRequest request = LikeRequest.builder()
                .userId("user_101")
                .postId("post_999")
                .build();

        LikeResponse response = LikeResponse.builder()
                .postId("post_999")
                .liked(true)
                .totalLikes(1)
                .build();

        when(likeService.likePost(any(LikeRequest.class))).thenReturn(response);

        mockMvc.perform(post("/v1/like")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.liked").value(true))
                .andExpect(jsonPath("$.data.totalLikes").value(1));
    }

    @Test
    void testUnlikePostEndpoint() throws Exception {
        LikeRequest request = LikeRequest.builder()
                .userId("user_101")
                .postId("post_999")
                .build();

        LikeResponse response = LikeResponse.builder()
                .postId("post_999")
                .liked(false)
                .totalLikes(0)
                .build();

        when(likeService.unlikePost(any(LikeRequest.class))).thenReturn(response);

        mockMvc.perform(post("/v1/unlike")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.liked").value(false))
                .andExpect(jsonPath("$.data.totalLikes").value(0));
    }

    @Test
    void testUnlikePostEndpointDeleteMethodWithBody() throws Exception {
        LikeRequest request = LikeRequest.builder()
                .userId("user_101")
                .postId("post_999")
                .build();

        LikeResponse response = LikeResponse.builder()
                .postId("post_999")
                .liked(false)
                .totalLikes(0)
                .build();

        when(likeService.unlikePost(any(LikeRequest.class))).thenReturn(response);

        mockMvc.perform(delete("/v1/unlike")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.liked").value(false))
                .andExpect(jsonPath("$.data.totalLikes").value(0));
    }

    @Test
    void testUnlikePostEndpointDeleteMethodWithQueryParams() throws Exception {
        LikeResponse response = LikeResponse.builder()
                .postId("post_999")
                .liked(false)
                .totalLikes(0)
                .build();

        when(likeService.unlikePost(any(LikeRequest.class))).thenReturn(response);

        mockMvc.perform(delete("/v1/unlike")
                        .param("userId", "user_101")
                        .param("postId", "post_999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.liked").value(false))
                .andExpect(jsonPath("$.data.totalLikes").value(0));
    }

    @Test
    void testGetLikeStatus() throws Exception {
        LikeResponse response = LikeResponse.builder()
                .postId("post_999")
                .liked(true)
                .totalLikes(5)
                .build();

        when(likeService.getLikeStatus("post_999", "user_101")).thenReturn(response);

        mockMvc.perform(get("/v1/like/post_999/status").param("userId", "user_101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.liked").value(true))
                .andExpect(jsonPath("$.data.totalLikes").value(5));
    }
}
