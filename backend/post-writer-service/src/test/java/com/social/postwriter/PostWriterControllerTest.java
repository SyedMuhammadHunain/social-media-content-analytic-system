package com.social.postwriter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.social.common.dto.CreatePostRequest;
import com.social.common.dto.UpdatePostRequest;
import com.social.common.model.Post;
import com.social.postwriter.controller.PostWriterController;
import com.social.postwriter.service.PostWriterService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PostWriterController.class)
class PostWriterControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PostWriterService postWriterService;

    @Test
    void testCreatePostEndpoint() throws Exception {
        CreatePostRequest request = CreatePostRequest.builder()
                .userId("user_101")
                .text("Testing Spring Boot microservices! #Java21")
                .mediaUrl("https://example.com/photo.jpg")
                .mediaType("IMAGE")
                .build();

        Post post = Post.builder()
                .id("post_999")
                .userId("user_101")
                .text("Testing Spring Boot microservices! #Java21")
                .mediaUrl("https://example.com/photo.jpg")
                .mediaType("IMAGE")
                .hashtags(List.of("Java21"))
                .likeCount(0)
                .commentCount(0)
                .deleted(false)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        when(postWriterService.createPost(any(CreatePostRequest.class))).thenReturn(post);

        mockMvc.perform(post("/v1/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.id").value("post_999"))
                .andExpect(jsonPath("$.data.userId").value("user_101"))
                .andExpect(jsonPath("$.data.mediaType").value("IMAGE"));
    }

    @Test
    void testGetPostById() throws Exception {
        Post post = Post.builder()
                .id("post_999")
                .userId("user_101")
                .text("Sample post")
                .deleted(false)
                .build();

        when(postWriterService.getPostById("post_999")).thenReturn(post);

        mockMvc.perform(get("/v1/posts/post_999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.id").value("post_999"));
    }

    @Test
    void testUpdatePost() throws Exception {
        UpdatePostRequest updateReq = UpdatePostRequest.builder()
                .userId("user_101")
                .text("Updated post text")
                .build();

        Post updatedPost = Post.builder()
                .id("post_999")
                .userId("user_101")
                .text("Updated post text")
                .build();

        when(postWriterService.updatePost(eq("post_999"), any(UpdatePostRequest.class))).thenReturn(updatedPost);

        mockMvc.perform(put("/v1/posts/post_999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.text").value("Updated post text"));
    }

    @Test
    void testDeletePost() throws Exception {
        when(postWriterService.deletePost("post_999", "user_101")).thenReturn(true);

        mockMvc.perform(delete("/v1/posts/post_999").param("userId", "user_101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.deleted").value(true));
    }
}
