package com.social.comment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.social.common.dto.CommentRequest;
import com.social.common.model.Comment;
import com.social.comment.controller.CommentController;
import com.social.comment.service.CommentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CommentController.class)
class CommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CommentService commentService;

    @Test
    void testAddCommentEndpoint() throws Exception {
        CommentRequest request = CommentRequest.builder()
                .userId("user_101")
                .postId("post_999")
                .content("Insightful post on microservices!")
                .build();

        Comment comment = Comment.builder()
                .id("comm_1")
                .userId("user_101")
                .postId("post_999")
                .content("Insightful post on microservices!")
                .createdAt(Instant.now())
                .build();

        when(commentService.addComment(any(CommentRequest.class))).thenReturn(comment);

        mockMvc.perform(post("/v1/comment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.id").value("comm_1"))
                .andExpect(jsonPath("$.data.content").value("Insightful post on microservices!"));
    }

    @Test
    void testAddNestedCommentReplyEndpoint() throws Exception {
        CommentRequest request = CommentRequest.builder()
                .userId("user_102")
                .postId("post_999")
                .content("I agree with your point!")
                .parentCommentId("comm_1")
                .build();

        Comment comment = Comment.builder()
                .id("comm_2")
                .userId("user_102")
                .postId("post_999")
                .content("I agree with your point!")
                .parentCommentId("comm_1")
                .createdAt(Instant.now())
                .build();

        when(commentService.addComment(any(CommentRequest.class))).thenReturn(comment);

        mockMvc.perform(post("/v1/comment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.id").value("comm_2"))
                .andExpect(jsonPath("$.data.parentCommentId").value("comm_1"))
                .andExpect(jsonPath("$.data.content").value("I agree with your point!"));
    }

    @Test
    void testGetCommentsForPost() throws Exception {
        Comment c1 = Comment.builder().id("comm_1").postId("post_999").content("First").build();
        Comment c2 = Comment.builder().id("comm_2").postId("post_999").content("Second").build();

        when(commentService.getCommentsByPostId("post_999")).thenReturn(List.of(c1, c2));

        mockMvc.perform(get("/v1/comment/post_999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    @Test
    void testDeleteCommentEndpoint() throws Exception {
        when(commentService.deleteComment("comm_1", "user_101")).thenReturn(true);

        mockMvc.perform(delete("/v1/comment/comm_1").param("userId", "user_101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.deleted").value(true));
    }
}
