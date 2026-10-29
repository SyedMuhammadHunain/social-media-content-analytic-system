// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Google OAuth 2.0 Client

export interface GoogleUserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  googleId: string;
}

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

/**
 * Ensures Google Identity Services (GIS) client script is dynamically loaded
 */
export function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  const globalWin = window as any;
  if (globalWin.google?.accounts?.oauth2) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      if (globalWin.google?.accounts?.oauth2) {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services script.')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services script.'));
    document.head.appendChild(script);
  });
}

/**
 * Initiates Google OAuth with forced account selection (prompt: 'select_account')
 * and validates the access token against the Google OAuth userinfo endpoint.
 */
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

  const globalWin = window as any;
  const oauth2 = globalWin.google?.accounts?.oauth2;

  if (!oauth2?.initTokenClient) {
    redirectToGoogleOAuth(clientId);
    return;
  }

  try {
    const tokenClient = oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      prompt: 'select_account',
      callback: async (tokenResponse: any) => {
        if (!tokenResponse) {
          options.onError(new Error('No response received from Google OAuth.'));
          return;
        }

        if (tokenResponse.error) {
          options.onError(new Error(tokenResponse.error_description || tokenResponse.error));
          return;
        }

        if (tokenResponse.access_token) {
          try {
            const profile = await fetchGoogleUserProfile(tokenResponse.access_token);
            await options.onSuccess(profile);
          } catch (fetchErr: any) {
            options.onError(fetchErr);
          }
        }
      },
      error_callback: (error: any) => {
        options.onError(new Error(error?.message || 'Google OAuth prompt was closed or rejected.'));
      },
    });

    tokenClient.requestAccessToken({ prompt: 'select_account' });
  } catch (err: any) {
    console.warn('Google tokenClient initialization failed, falling back to redirect:', err);
    redirectToGoogleOAuth(clientId);
  }
}

/**
 * Validates Google Access Token by querying Google's standard userinfo endpoint
 */
export async function fetchGoogleUserProfile(accessToken: string): Promise<GoogleUserProfile> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Google token validation failed with status ${res.status}`);
  }

  const data = await res.json();
  if (!data.email) {
    throw new Error('Google account did not return a valid email address.');
  }

  return {
    name: data.name || data.given_name || data.email.split('@')[0],
    email: data.email,
    avatarUrl: data.picture,
    googleId: data.sub || `goog_${Date.now()}`,
  };
}

/**
 * Navigates directly to Google OAuth 2.0 endpoint with prompt=select_account
 * so Google presents the account chooser screen.
 */
export function redirectToGoogleOAuth(clientId?: string): void {
  if (typeof window === 'undefined') return;
  const activeClientId = clientId || getGoogleClientId();
  // Must match exactly the registered URI in client_secret JSON: http://localhost:5173 (no trailing slash)
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

/**
 * Checks URL hash on page load for OAuth redirect callback (#access_token=...)
 */
export async function checkGoogleOAuthRedirect(): Promise<GoogleUserProfile | null> {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  if (!hash || !hash.includes('access_token=')) return null;

  try {
    const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;
    const params = new URLSearchParams(cleanHash);
    const accessToken = params.get('access_token');

    if (accessToken) {
      // Remove hash from address bar without reloading
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      return await fetchGoogleUserProfile(accessToken);
    }
  } catch (err) {
    console.error('Error parsing Google OAuth redirect hash:', err);
  }

  return null;
}
