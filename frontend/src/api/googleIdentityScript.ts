// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Google Identity Script Loader

function attachScriptListeners(script: HTMLScriptElement, resolve: () => void, reject: (err: Error) => void) {
  script.addEventListener('load', () => resolve());
  script.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services script.')));
}

function appendNewScript(resolve: () => void, reject: (err: Error) => void) {
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  attachScriptListeners(script, resolve, reject);
  document.head.appendChild(script);
}

function handleExistingScript(
  existing: HTMLScriptElement,
  oauth2: unknown,
  resolve: () => void,
  reject: (err: Error) => void
) {
  if (oauth2) {
    resolve();
    return;
  }
  attachScriptListeners(existing, resolve, reject);
}

/**
 * Ensures Google Identity Services (GIS) client script is dynamically loaded
 */
export function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  const globalWin = window as any;
  const oauth2 = globalWin.google?.accounts?.oauth2;
  if (oauth2) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      handleExistingScript(existing, oauth2, resolve, reject);
      return;
    }
    appendNewScript(resolve, reject);
  });
}
