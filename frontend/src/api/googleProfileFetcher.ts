// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Google User Profile Fetcher

export interface GoogleUserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  googleId: string;
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
