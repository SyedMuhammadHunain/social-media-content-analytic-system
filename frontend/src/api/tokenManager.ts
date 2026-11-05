// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - API Token & Base URL Manager

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
