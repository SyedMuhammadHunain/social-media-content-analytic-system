// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - HTTP API Client Base

export interface ApiResponse<T> {
  status: 'SUCCESS' | 'ERROR' | string;
  message?: string;
  data: T;
  timestamp?: string;
}

export class ApiError extends Error {
  status: number;
  statusText: string;
  responseBody?: unknown;

  constructor(status: number, statusText: string, message?: string, responseBody?: unknown) {
    super(message || `API error ${status}: ${statusText}`);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.responseBody = responseBody;
  }
}

let configuredBaseUrl: string | null = null;
let activeAuthToken: string | null = null;

export function getApiGatewayUrl(): string {
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }
  const globalObj = typeof globalThis !== 'undefined' ? (globalThis as Record<string, any>) : undefined;
  const envUrl =
    typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env.VITE_API_GATEWAY_URL
      : globalObj?.process?.env?.VITE_API_GATEWAY_URL;

  if (envUrl) {
    return envUrl;
  }

  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return `http://${window.location.hostname}:8080`;
  }

  return 'http://127.0.0.1:8080';
}

export function setApiGatewayUrl(url: string | null): void {
  configuredBaseUrl = url;
}

export function setAuthToken(token: string | null): void {
  activeAuthToken = token;
}

export function getAuthToken(): string | null {
  return activeAuthToken;
}

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  skipAuth?: boolean;
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

  const requestHeaders: Record<string, string> = {
    'Accept': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (!skipAuth && activeAuthToken && !requestHeaders['Authorization']) {
    requestHeaders['Authorization'] = `Bearer ${activeAuthToken}`;
  }

  // Set Content-Type only if not sending FormData
  if (!(fetchOptions.body instanceof FormData) && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(fullUrl, {
      ...fetchOptions,
      headers: requestHeaders,
      signal: controller.signal,
    });

    clearTimeout(timer);

    const isJson = response.headers.get('content-type')?.includes('application/json');
    let responseData: any = null;

    if (isJson) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        (responseData && typeof responseData === 'object' && responseData.message) ||
        response.statusText ||
        `HTTP request failed with status ${response.status}`;
      throw new ApiError(response.status, response.statusText, errorMessage, responseData);
    }

    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      const envelope = responseData as ApiResponse<T>;
      if (envelope.status === 'ERROR') {
        throw new ApiError(response.status, 'Application Error', envelope.message || 'Server error', envelope);
      }
      return envelope.data;
    }

    return responseData as T;
  } catch (error: any) {
    clearTimeout(timer);
    if (error.name === 'AbortError') {
      throw new ApiError(408, 'Request Timeout', `Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
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

  del: <T>(path: string, bodyOrOptions?: unknown, options?: RequestOptions) => {
    const isOptions =
      bodyOrOptions &&
      typeof bodyOrOptions === 'object' &&
      !Array.isArray(bodyOrOptions) &&
      options === undefined &&
      ('timeoutMs' in bodyOrOptions || 'skipAuth' in bodyOrOptions || 'headers' in bodyOrOptions || 'signal' in bodyOrOptions);

    if (isOptions) {
      return apiRequest<T>(path, { ...(bodyOrOptions as RequestOptions), method: 'DELETE' });
    }

    return apiRequest<T>(path, {
      ...options,
      method: 'DELETE',
      body:
        bodyOrOptions !== undefined
          ? bodyOrOptions instanceof FormData
            ? bodyOrOptions
            : JSON.stringify(bodyOrOptions)
          : undefined,
    });
  },
};

export async function checkGatewayHealth(): Promise<boolean> {
  try {
    await api.get<{ status: string }>('/actuator/health', { timeoutMs: 2500, skipAuth: true });
    return true;
  } catch {
    return false;
  }
}
