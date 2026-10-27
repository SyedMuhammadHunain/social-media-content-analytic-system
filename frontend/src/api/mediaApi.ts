// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Media Pre-Signed URL API (Azure Blob Storage)

import { api } from './client.ts';

export interface PresignRequest {
  userId: string;
  fileName: string;
  contentType: string;
}

export interface PresignResponse {
  uploadUrl: string;
  publicBlobUrl: string;
  expiresAt: string;
}

export const mediaApi = {
  getPresignedUploadUrl(request: PresignRequest): Promise<PresignResponse> {
    return api.post<PresignResponse>('/v1/media/presign', request);
  },

  async uploadBlob(uploadUrl: string, file: Blob | File, contentType: string): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': contentType,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Media upload failed: ${response.status} ${response.statusText}`);
    }
  },
};
