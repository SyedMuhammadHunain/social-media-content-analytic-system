package com.social.presign;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.models.PublicAccessType;
import com.social.common.dto.PresignRequest;
import com.social.common.dto.PresignResponse;
import com.social.presign.service.AzureBlobSasService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.File;
import java.io.FileInputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Properties;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class AzureBlobIntegrationTest {

    @Autowired
    private AzureBlobSasService sasService;

    private static String getConnectionString() {
        String connStr = System.getProperty("azure.storage.connection-string");
        if (connStr != null && !connStr.isBlank()) {
            return connStr;
        }
        connStr = System.getenv("AZURE_STORAGE_CONNECTION_STRING");
        if (connStr != null && !connStr.isBlank()) {
            return connStr;
        }

        // Try reading from backend/.env
        File envFile = new File("../.env");
        if (!envFile.exists()) {
            envFile = new File(".env");
        }
        if (envFile.exists()) {
            try (FileInputStream fis = new FileInputStream(envFile)) {
                Properties props = new Properties();
                props.load(fis);
                String fromEnv = props.getProperty("AZURE_STORAGE_CONNECTION_STRING");
                if (fromEnv != null && !fromEnv.isBlank()) {
                    return fromEnv.replace("\"", "").trim();
                }
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    @Test
    @DisplayName("Verify live Azure Blob Storage container connectivity and SAS upload/download lifecycle")
    void testLiveAzureBlobStorageLifecycle() throws Exception {
        String connectionString = getConnectionString();
        if (connectionString == null || connectionString.isBlank()) {
            System.out.println("SKIP: AZURE_STORAGE_CONNECTION_STRING not provided. Skipping live Azure cloud test.");
            return;
        }

        // 1. Connect and verify account
        BlobServiceClient serviceClient = new BlobServiceClientBuilder()
                .connectionString(connectionString)
                .buildClient();

        assertNotNull(serviceClient.getAccountName(), "Azure storage account name must not be null");
        assertEquals("socialmediaanalysis", serviceClient.getAccountName().toLowerCase());

        // 2. Ensure container 'media-assets' exists with public blob read access
        BlobContainerClient containerClient = serviceClient.getBlobContainerClient("media-assets");
        if (!containerClient.exists()) {
            containerClient.createWithResponse(null, PublicAccessType.BLOB, null, null);
        }
        assertTrue(containerClient.exists(), "media-assets container must exist on Azure");

        // 3. Generate SAS URL via service
        String testFileName = "test_blob_" + UUID.randomUUID().toString().substring(0, 8) + ".txt";
        PresignRequest presignReq = PresignRequest.builder()
                .userId("test_user_hunain")
                .fileName(testFileName)
                .contentType("text/plain")
                .build();

        PresignResponse presignRes = sasService.generatePresignedUploadUrl(presignReq);
        assertNotNull(presignRes);
        assertNotNull(presignRes.getUploadUrl());
        assertTrue(presignRes.getUploadUrl().contains("sig="), "Upload URL must contain signed SAS query string");
        assertNotNull(presignRes.getPublicBlobUrl());
        assertTrue(presignRes.getPublicBlobUrl().startsWith("https://socialmediaanalysis.blob.core.windows.net/media-assets/"));

        // 4. Perform direct binary upload (PUT) using HttpClient with x-ms-blob-type: BlockBlob
        byte[] payloadBytes = ("Test Azure Blob Payload: " + UUID.randomUUID()).getBytes(StandardCharsets.UTF_8);
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();

        HttpRequest putRequest = HttpRequest.newBuilder()
                .uri(URI.create(presignRes.getUploadUrl()))
                .header("x-ms-blob-type", "BlockBlob")
                .header("Content-Type", "text/plain")
                .PUT(HttpRequest.BodyPublishers.ofByteArray(payloadBytes))
                .build();

        HttpResponse<String> putResponse = httpClient.send(putRequest, HttpResponse.BodyHandlers.ofString());
        assertEquals(201, putResponse.statusCode(), "Azure direct upload PUT must return 201 Created");

        // 5. Verify public read access via GET on publicBlobUrl
        HttpRequest getRequest = HttpRequest.newBuilder()
                .uri(URI.create(presignRes.getPublicBlobUrl()))
                .GET()
                .build();

        HttpResponse<byte[]> getResponse = httpClient.send(getRequest, HttpResponse.BodyHandlers.ofByteArray());
        assertEquals(200, getResponse.statusCode(), "Public blob URL must return 200 OK without SAS signature");
        assertArrayEquals(payloadBytes, getResponse.body(), "Downloaded payload must match uploaded bytes exactly");

        // 6. Cleanup test blob
        String blobPath = presignRes.getPublicBlobUrl().substring(presignRes.getPublicBlobUrl().indexOf("media-assets/") + "media-assets/".length());
        BlobClient blobClient = containerClient.getBlobClient(blobPath);
        if (blobClient.exists()) {
            blobClient.delete();
        }
        System.out.println("Verified Azure Blob Storage: Account=" + serviceClient.getAccountName() + ", Container=media-assets, Roundtrip=SUCCESS");
    }
}
