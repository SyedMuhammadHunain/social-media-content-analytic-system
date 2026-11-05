// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - HTTP Payload Parser

import { type ApiResponse, ApiError } from './tokenManager.ts';

function extractErrorMessage(response: Response, responseData: unknown): string {
  if (responseData && typeof responseData === 'object') {
    const candidate = (responseData as { message?: unknown }).message;
    if (typeof candidate === 'string') return candidate;
  }
  return response.statusText || `HTTP error ${response.status}`;
}

function unwrapEnvelopeOrThrow<T>(status: number, responseData: unknown): T {
  if (responseData && typeof responseData === 'object') {
    if ('data' in responseData) {
      const envelope = responseData as ApiResponse<T>;
      if (envelope.status === 'ERROR') {
        throw new ApiError(status, 'Application Error', envelope.message || 'Server error', envelope);
      }
      return envelope.data;
    }
  }
  return responseData as T;
}

export async function parseHttpResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const responseData: any = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMsg = extractErrorMessage(response, responseData);
    throw new ApiError(response.status, response.statusText, errorMsg, responseData);
  }

  return unwrapEnvelopeOrThrow<T>(response.status, responseData);
}
