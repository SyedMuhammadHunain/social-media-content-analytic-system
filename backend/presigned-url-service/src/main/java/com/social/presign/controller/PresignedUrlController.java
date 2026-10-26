package com.social.presign.controller;

import com.social.common.dto.ApiResponse;
import com.social.common.dto.PresignRequest;
import com.social.common.dto.PresignResponse;
import com.social.presign.service.AzureBlobSasService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/media")
public class PresignedUrlController {

    private final AzureBlobSasService sasService;

    public PresignedUrlController(AzureBlobSasService sasService) {
        this.sasService = sasService;
    }

    @PostMapping("/presign")
    public ResponseEntity<ApiResponse<PresignResponse>> generatePresignedUrl(@Valid @RequestBody PresignRequest request) {
        PresignResponse response = sasService.generatePresignedUploadUrl(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Presigned SAS URL generated successfully."));
    }
}
