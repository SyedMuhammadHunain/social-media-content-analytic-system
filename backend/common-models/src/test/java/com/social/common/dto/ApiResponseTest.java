package com.social.common.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ApiResponseTest {

    @Test
    void testSuccessEnvelope() {
        ApiResponse<String> response = ApiResponse.success("test payload", "Custom message");
        assertEquals("SUCCESS", response.getStatus());
        assertEquals("Custom message", response.getMessage());
        assertEquals("test payload", response.getData());
        assertNotNull(response.getTimestamp());
    }

    @Test
    void testErrorEnvelope() {
        ApiErrorResponse error = ApiErrorResponse.of("NOT_FOUND", "Entity not found");
        assertEquals("ERROR", error.getStatus());
        assertEquals("NOT_FOUND", error.getErrorCode());
        assertEquals("Entity not found", error.getMessage());
        assertNotNull(error.getTimestamp());
    }
}
