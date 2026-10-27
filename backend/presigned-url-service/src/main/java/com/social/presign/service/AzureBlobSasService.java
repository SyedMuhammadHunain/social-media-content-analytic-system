package com.social.presign.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.models.PublicAccessType;
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
        String sanitizedUserId = sanitizeIdentifier(request.getUserId());
        String sanitizedFile = sanitizeFileName(request.getFileName());
        String uniqueBlobName = String.format("%s/%s_%s",
                sanitizedUserId,
                UUID.randomUUID().toString().substring(0, 8),
                sanitizedFile
        );

        Instant expiresAt = Instant.now().plus(Duration.ofMinutes(expiryMinutes));

        if (connectionString != null && !connectionString.isBlank()) {
            try {
                return generateAzureSas(request, uniqueBlobName, expiresAt);
            } catch (Exception e) {
                log.warn("Azure Storage connection error, falling back to local simulated SAS URL: {}", e.getMessage());
            }
        }

        return generateSimulatedSas(uniqueBlobName, expiresAt);
    }

    private PresignResponse generateAzureSas(PresignRequest request, String blobName, Instant expiresAt) {
        BlobServiceClient serviceClient = new BlobServiceClientBuilder()
                .connectionString(connectionString)
                .buildClient();

        BlobContainerClient containerClient = serviceClient.getBlobContainerClient(containerName);
        if (!containerClient.exists()) {
            containerClient.createWithResponse(null, PublicAccessType.BLOB, null, null);
        }

        BlobClient blobClient = containerClient.getBlobClient(blobName);
        BlobSasPermission permissions = new BlobSasPermission()
                .setCreatePermission(true)
                .setWritePermission(true);

        BlobServiceSasSignatureValues sasValues = new BlobServiceSasSignatureValues(
                OffsetDateTime.ofInstant(expiresAt, java.time.ZoneOffset.UTC),
                permissions
        ).setContentType(request.getContentType());

        String sasToken = blobClient.generateSas(sasValues);
        return PresignResponse.builder()
                .uploadUrl(blobClient.getBlobUrl() + "?" + sasToken)
                .publicBlobUrl(blobClient.getBlobUrl())
                .expiresAt(expiresAt)
                .build();
    }

    private PresignResponse generateSimulatedSas(String blobName, Instant expiresAt) {
        String mockUploadUrl = String.format("http://localhost:8082/mock-storage/%s/%s?sig=mock-sas-token&se=%s",
                containerName, blobName, expiresAt);
        String mockPublicUrl = String.format("http://localhost:8082/mock-storage/%s/%s",
                containerName, blobName);

        return PresignResponse.builder()
                .uploadUrl(mockUploadUrl)
                .publicBlobUrl(mockPublicUrl)
                .expiresAt(expiresAt)
                .build();
    }

    private String sanitizeIdentifier(String id) {
        if (id == null || id.isBlank()) {
            return "anonymous";
        }
        return id.replaceAll("[^a-zA-Z0-9_-]", "_");
    }

    private String sanitizeFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "media.bin";
        }
        String baseName = fileName.replace('\\', '/');
        int lastSlash = baseName.lastIndexOf('/');
        if (lastSlash >= 0) {
            baseName = baseName.substring(lastSlash + 1);
        }
        String sanitized = baseName.replaceAll("^\\.+", "").replaceAll("[^a-zA-Z0-9._-]", "_");
        return sanitized.isBlank() ? "media.bin" : sanitized;
    }
}
