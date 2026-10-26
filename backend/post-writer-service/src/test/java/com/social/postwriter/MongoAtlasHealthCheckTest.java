package com.social.postwriter;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.FileInputStream;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class MongoAtlasHealthCheckTest {

    @Test
    @DisplayName("Verify live MongoDB Atlas connectivity, ping, and authentication")
    void testAtlasConnectivity() {
        String uri = AtlasTestHelper.resolveUri();
        if (uri == null) {
            System.out.println("MONGODB_URI not found. Skipping live Atlas connectivity test.");
            return;
        }

        System.out.println("Connecting to MongoDB Atlas endpoint...");
        long startTime = System.currentTimeMillis();

        try (MongoClient client = MongoClients.create(uri)) {
            MongoDatabase database = client.getDatabase("SocialMediaContentAnalysisSystem");
            Document pingCommand = new Document("ping", 1);
            Document response = database.runCommand(pingCommand);

            long latencyMs = System.currentTimeMillis() - startTime;
            System.out.println("=== MongoDB Atlas Health Check ===");
            System.out.println("Status: CONNECTED");
            System.out.println("Cluster Ping Response: " + response.toJson());
            System.out.println("Round-trip Latency: " + latencyMs + " ms");
            System.out.println("Database: " + database.getName());

            assertNotNull(response);
            Number okValue = (Number) response.get("ok");
            assertNotNull(okValue, "Response 'ok' field should not be null");
            assertEquals(1, okValue.intValue(), "Atlas ping should return ok: 1");
        }
    }
}
