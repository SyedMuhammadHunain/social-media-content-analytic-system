// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - HTTP API Client Base

import {
  type ApiResponse,
  ApiError,
  getApiGatewayUrl,
  getAuthToken,
} from './tokenManager.ts';

export * from './tokenManager.ts';

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  skipAuth?: boolean;
}

function buildHeaders(headers?: HeadersInit, skipAuth = false, isFormData = false): Record<string, string> {
  const reqHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string>),
  };

  if (!skipAuth) {
    const activeToken = getAuthToken();
    if (activeToken) {
      if (!reqHeaders.Authorization) {
        reqHeaders.Authorization = `Bearer ${activeToken}`;
      }
    }
  }

  if (!isFormData) {
    if (!reqHeaders['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
    }
  }

  return reqHeaders;
}

async function parseBody<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const responseData: any = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const hasMsg = responseData && typeof responseData === 'object';
    const errorMsg = (hasMsg && responseData.message) || response.statusText || `HTTP error ${response.status}`;
    throw new ApiError(response.status, response.statusText, errorMsg, responseData);
  }

  const isEnvelope = Boolean(responseData && typeof responseData === 'object');
  if (isEnvelope) {
    if ('data' in responseData) {
      const envelope = responseData as ApiResponse<T>;
      if (envelope.status === 'ERROR') {
        throw new ApiError(response.status, 'Application Error', envelope.message || 'Server error', envelope);
      }
      return envelope.data;
    }
  }

  return responseData as T;
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
    return await parseBody<T>(response);
  } catch (error: any) {
    clearTimeout(timer);
    if (error.name === 'AbortError') {
      throw new ApiError(408, 'Request Timeout', `Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}

function resolveDeleteOptions(bodyOrOptions?: unknown, options?: RequestOptions): RequestOptions {
  const isOpt =
    bodyOrOptions &&
    typeof bodyOrOptions === 'object' &&
    options === undefined &&
    ('timeoutMs' in bodyOrOptions || 'skipAuth' in bodyOrOptions || 'headers' in bodyOrOptions);

  if (isOpt) {
    return { ...(bodyOrOptions as RequestOptions), method: 'DELETE' };
  }

  const body =
    bodyOrOptions !== undefined
      ? bodyOrOptions instanceof FormData
        ? bodyOrOptions
        : JSON.stringify(bodyOrOptions)
      : undefined;

  return { ...options, method: 'DELETE', body };
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T>(path: string, bodyOrOptions?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, resolveDeleteOptions(bodyOrOptions, options)),

  del: <T>(path: string, bodyOrOptions?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, resolveDeleteOptions(bodyOrOptions, options)),
};

export default api;
