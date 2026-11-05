// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Google OAuth 2.0 Client Aggregator

import { loadGoogleIdentityScript } from './googleIdentityScript.ts';
import { fetchGoogleUserProfile, type GoogleUserProfile } from './googleProfileFetcher.ts';
import {
  getGoogleClientId,
  redirectToGoogleOAuth,
  initiateGoogleOAuth,
  type GoogleOAuthOptions,
} from './googleOAuthLauncher.ts';

export type { GoogleUserProfile, GoogleOAuthOptions };
export {
  loadGoogleIdentityScript,
  fetchGoogleUserProfile,
  getGoogleClientId,
  redirectToGoogleOAuth,
  initiateGoogleOAuth,
};

export async function checkGoogleOAuthRedirect(): Promise<GoogleUserProfile | null> {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  if (!hash || !hash.includes('access_token=')) return null;

  try {
    const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;
    const params = new URLSearchParams(cleanHash);
    const accessToken = params.get('access_token');

    if (accessToken) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      return await fetchGoogleUserProfile(accessToken);
    }
  } catch (err) {
    console.error('Error parsing Google OAuth redirect hash:', err);
  }

  return null;
}
