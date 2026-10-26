package com.social.feedreader;

import com.social.common.dto.FeedResponse;
import com.social.feedreader.controller.FeedReaderController;
import com.social.feedreader.service.FeedReaderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(FeedReaderController.class)
class FeedReaderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FeedReaderService feedReaderService;

    @Test
    void testGetFeedEndpoint() throws Exception {
        FeedResponse.FeedPostDto postDto = FeedResponse.FeedPostDto.builder()
                .postId("post_100")
                .authorId("author_1")
                .authorName("Jane Doe")
                .text("Newsfeed microservices live test!")
                .mediaType("TEXT")
                .likeCount(3)
                .commentCount(1)
                .createdAt(Instant.now())
                .build();

        FeedResponse response = FeedResponse.builder()
                .userId("user_101")
                .page(0)
                .size(20)
                .posts(List.of(postDto))
                .build();

        when(feedReaderService.getFeedForUser("user_101", 0, 20)).thenReturn(response);

        mockMvc.perform(get("/v1/feeds/user_101").param("page", "0").param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.userId").value("user_101"))
                .andExpect(jsonPath("$.data.posts.length()").value(1))
                .andExpect(jsonPath("$.data.posts[0].postId").value("post_100"));
    }
}
