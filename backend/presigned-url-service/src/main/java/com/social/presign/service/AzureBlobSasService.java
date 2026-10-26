package com.social.presign.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.sas.BlobSasPermission;
import com.azure.storage.blob.sas.BlobServiceSasSignatureValues;
import com.social.common.dto.PresignRequest;
import com.social.common.dto.PresignResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class AzureBlobSasService {

    private static final Logger log = LoggerFactory.getLogger(AzureBlobSasService.class);

    @Value("${azure.storage.connection-string:}")
    private String connectionString;

    @Value("${azure.storage.container-name:media-assets}")
    private String containerName;

    @Value("${azure.storage.sas-expiry-minutes:15}")
    private int expiryMinutes;

    public PresignResponse generatePresignedUploadUrl(PresignRequest request) {
        String uniqueBlobName = String.format("%s/%s_%s",
                request.getUserId(),
                UUID.randomUUID().toString().substring(0, 8),
                sanitizeFileName(request.getFileName())
        );

        Instant expiresAt = Instant.now().plus(Duration.ofMinutes(expiryMinutes));

        if (connectionString != null && !connectionString.isBlank()) {
            try {
                BlobServiceClient serviceClient = new BlobServiceClientBuilder()
                        .connectionString(connectionString)
                        .buildClient();

                BlobContainerClient containerClient = serviceClient.getBlobContainerClient(containerName);
                if (!containerClient.exists()) {
                    containerClient.create();
                }

                BlobClient blobClient = containerClient.getBlobClient(uniqueBlobName);

                BlobSasPermission permissions = new BlobSasPermission()
                        .setCreatePermission(true)
                        .setWritePermission(true);

                BlobServiceSasSignatureValues sasValues = new BlobServiceSasSignatureValues(
                        OffsetDateTime.now().plusMinutes(expiryMinutes),
                        permissions
                ).setContentType(request.getContentType());

                String sasToken = blobClient.generateSas(sasValues);
                String uploadUrl = blobClient.getBlobUrl() + "?" + sasToken;
                String publicBlobUrl = blobClient.getBlobUrl();

                return PresignResponse.builder()
                        .uploadUrl(uploadUrl)
                        .publicBlobUrl(publicBlobUrl)
                        .expiresAt(expiresAt)
                        .build();

            } catch (Exception e) {
                log.warn("Azure Storage connection error, falling back to local simulated SAS URL: {}", e.getMessage());
            }
        }

        // Development/Offline Fallback URL
        String mockUploadUrl = String.format("http://localhost:8082/mock-storage/%s/%s?sig=mock-sas-token&se=%s",
                containerName, uniqueBlobName, expiresAt.toString());
        String mockPublicUrl = String.format("http://localhost:8082/mock-storage/%s/%s",
                containerName, uniqueBlobName);

        return PresignResponse.builder()
                .uploadUrl(mockUploadUrl)
                .publicBlobUrl(mockPublicUrl)
                .expiresAt(expiresAt)
                .build();
    }

    private String sanitizeFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "media.bin";
        }
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
