package com.social.presign;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.social.common.dto.PresignRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PresignedUrlControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testPresignEndpointSuccess() throws Exception {
        PresignRequest request = PresignRequest.builder()
                .userId("user_101")
                .fileName("sample-image.png")
                .contentType("image/png")
                .build();

        mockMvc.perform(post("/v1/media/presign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.uploadUrl").isNotEmpty())
                .andExpect(jsonPath("$.data.publicBlobUrl").isNotEmpty())
                .andExpect(jsonPath("$.data.expiresAt").isNotEmpty());
    }

    @Test
    void testPresignValidationFailure() throws Exception {
        PresignRequest invalidRequest = PresignRequest.builder()
                .userId("") // invalid
                .fileName("sample.png")
                .contentType("image/png")
                .build();

        mockMvc.perform(post("/v1/media/presign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }
}
