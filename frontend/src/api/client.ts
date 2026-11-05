// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - HTTP API Client Base

import {
  ApiError,
  getApiGatewayUrl,
  getAuthToken,
} from './tokenManager.ts';
import { parseHttpResponse } from './httpPayloadParser.ts';

export * from './tokenManager.ts';

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  skipAuth?: boolean;
}

function applyAuthHeader(reqHeaders: Record<string, string>, skipAuth: boolean) {
  if (skipAuth) return;
  const activeToken = getAuthToken();
  if (activeToken && !reqHeaders.Authorization) {
    reqHeaders.Authorization = `Bearer ${activeToken}`;
  }
}

function buildHeaders(headers?: HeadersInit, skipAuth = false, isFormData = false): Record<string, string> {
  const reqHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string>),
  };

  applyAuthHeader(reqHeaders, skipAuth);

  if (!isFormData && !reqHeaders['Content-Type']) {
    reqHeaders['Content-Type'] = 'application/json';
  }

  return reqHeaders;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { timeoutMs = 8000, skipAuth = false, headers, ...fetchOptions } = options;
  const baseUrl = getApiGatewayUrl().replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${baseUrl}${cleanPath}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const isFormData = fetchOptions.body instanceof FormData;
  const requestHeaders = buildHeaders(headers, skipAuth, isFormData);

  try {
    const response = await fetch(fullUrl, {
      ...fetchOptions,
      headers: requestHeaders,
      signal: controller.signal,
    });
    clearTimeout(timer);
    return await parseHttpResponse<T>(response);
  } catch (error: any) {
    clearTimeout(timer);
    if (error.name === 'AbortError') {
      throw new ApiError(408, 'Request Timeout', `Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}

function isOptionsObject(target: unknown): target is RequestOptions {
  if (!target || typeof target !== 'object') return false;
  return 'timeoutMs' in target || 'skipAuth' in target || 'headers' in target;
}

function resolveDeleteOptions(bodyOrOptions?: unknown, options?: RequestOptions): RequestOptions {
  if (options === undefined && isOptionsObject(bodyOrOptions)) {
    return { ...bodyOrOptions, method: 'DELETE' };
  }

  let body: BodyInit | undefined;
  if (bodyOrOptions !== undefined) {
    body = bodyOrOptions instanceof FormData ? bodyOrOptions : JSON.stringify(bodyOrOptions);
  }

  return { ...options, method: 'DELETE', body };
}

export const api = {
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return apiRequest<T>(path, { ...options, method: 'GET' });
  },

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const serializedBody =
      body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined;
    return apiRequest<T>(path, {
      ...options,
      method: 'POST',
      body: serializedBody,
    });
  },

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const serializedBody =
      body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined;
    return apiRequest<T>(path, {
      ...options,
      method: 'PUT',
      body: serializedBody,
    });
  },

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const serializedBody =
      body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined;
    return apiRequest<T>(path, {
      ...options,
      method: 'PATCH',
      body: serializedBody,
    });
  },

  delete<T>(path: string, bodyOrOptions?: unknown, options?: RequestOptions): Promise<T> {
    const resolvedOptions = resolveDeleteOptions(bodyOrOptions, options);
    return apiRequest<T>(path, resolvedOptions);
  },

  del<T>(path: string, bodyOrOptions?: unknown, options?: RequestOptions): Promise<T> {
    const resolvedOptions = resolveDeleteOptions(bodyOrOptions, options);
    return apiRequest<T>(path, resolvedOptions);
  },
};

export default api;
