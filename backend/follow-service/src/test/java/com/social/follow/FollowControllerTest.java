package com.social.follow;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.social.common.dto.FollowRequest;
import com.social.common.dto.FollowResponse;
import com.social.follow.controller.FollowController;
import com.social.follow.service.FollowService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(FollowController.class)
class FollowControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private FollowService followService;

    @Test
    void testFollowUserEndpoint() throws Exception {
        FollowRequest request = FollowRequest.builder()
                .followerId("user_101")
                .followingId("user_102")
                .build();

        FollowResponse response = FollowResponse.builder()
                .followerId("user_101")
                .followingId("user_102")
                .isFollowing(true)
                .build();

        when(followService.followUser(any(FollowRequest.class))).thenReturn(response);

        mockMvc.perform(post("/v1/follow")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.isFollowing").value(true));
    }

    @Test
    void testUnfollowUserEndpoint() throws Exception {
        FollowRequest request = FollowRequest.builder()
                .followerId("user_101")
                .followingId("user_102")
                .build();

        FollowResponse response = FollowResponse.builder()
                .followerId("user_101")
                .followingId("user_102")
                .isFollowing(false)
                .build();

        when(followService.unfollowUser(any(FollowRequest.class))).thenReturn(response);

        mockMvc.perform(post("/v1/unfollow")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.isFollowing").value(false));
    }

    @Test
    void testGetFollowers() throws Exception {
        when(followService.getFollowerIds("user_102")).thenReturn(List.of("user_101", "user_103"));

        mockMvc.perform(get("/v1/follow/user_102/followers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.length()").value(2));
    }
}
