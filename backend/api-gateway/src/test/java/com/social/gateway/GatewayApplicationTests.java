package com.social.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class GatewayApplicationTests {

    @Autowired
    private WebTestClient webTestClient;

    @Test
    void testGatewayStatusEndpoint() {
        webTestClient.get()
                .uri("/v1/gateway/status")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.status").isEqualTo("SUCCESS")
                .jsonPath("$.data.service").isEqualTo("api-gateway")
                .jsonPath("$.data.status").isEqualTo("UP");
    }

    @Test
    void testCorsHeadersOnOptions() {
        webTestClient.options()
                .uri("/v1/gateway/status")
                .header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "GET")
                .exchange()
                .expectStatus().isOk()
                .expectHeader().valueEquals("Access-Control-Allow-Origin", "http://localhost:5173");
    }
}
