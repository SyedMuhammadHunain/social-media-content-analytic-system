// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Google OAuth Client Launcher

import { loadGoogleIdentityScript } from './googleIdentityScript.ts';
import { fetchGoogleUserProfile, type GoogleUserProfile } from './googleProfileFetcher.ts';

export interface GoogleOAuthOptions {
  onSuccess: (profile: GoogleUserProfile) => void | Promise<void>;
  onError: (error: Error) => void;
}

const DEFAULT_CLIENT_ID = '91237848128-k9an0mtlmps8gp09oe3lj5ebrsjfiue6.apps.googleusercontent.com';

export function getGoogleClientId(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID;
  }
  return DEFAULT_CLIENT_ID;
}

export function redirectToGoogleOAuth(clientId?: string): void {
  if (typeof window === 'undefined') return;
  const activeClientId = clientId || getGoogleClientId();
  const redirectUri = window.location.origin;
  const params = new URLSearchParams({
    client_id: activeClientId,
    redirect_uri: redirectUri,
    response_type: 'token',
    scope: 'openid email profile',
    prompt: 'select_account',
  });
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

function handleTokenResponse(tokenResponse: any, options: GoogleOAuthOptions) {
  if (!tokenResponse) {
    options.onError(new Error('No response received from Google OAuth.'));
    return;
  }
  if (tokenResponse.error) {
    options.onError(new Error(tokenResponse.error_description || tokenResponse.error));
    return;
  }
  if (tokenResponse.access_token) {
    fetchGoogleUserProfile(tokenResponse.access_token)
      .then(options.onSuccess)
      .catch(options.onError);
  }
}

function setupTokenClient(clientId: string, options: GoogleOAuthOptions) {
  const globalWin = window as any;
  const oauth2 = globalWin.google?.accounts?.oauth2;
  if (!oauth2?.initTokenClient) {
    redirectToGoogleOAuth(clientId);
    return;
  }

  const tokenClient = oauth2.initTokenClient({
    client_id: clientId,
    scope: 'openid email profile',
    prompt: 'select_account',
    callback: (tokenResponse: any) => handleTokenResponse(tokenResponse, options),
    error_callback: (error: any) => {
      options.onError(new Error(error?.message || 'Google OAuth prompt was closed or rejected.'));
    },
  });

  tokenClient.requestAccessToken({ prompt: 'select_account' });
}

export async function initiateGoogleOAuth(options: GoogleOAuthOptions): Promise<void> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    options.onError(new Error('Google Client ID is not configured. Please check VITE_GOOGLE_CLIENT_ID.'));
    return;
  }

  try {
    await loadGoogleIdentityScript();
  } catch (err: any) {
    console.warn('GIS script failed to load, falling back to full-page OAuth redirect:', err);
    redirectToGoogleOAuth(clientId);
    return;
  }

  try {
    setupTokenClient(clientId, options);
  } catch (err: any) {
    console.warn('Google tokenClient initialization failed, falling back to redirect:', err);
    redirectToGoogleOAuth(clientId);
  }
}
