// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Media Blob Persistence Store (IndexedDB)

const DB_NAME = 'smcas_media_db';
const STORE_NAME = 'media_blobs';
const DB_VERSION = 1;

// In-memory fallback if IndexedDB is unavailable
const memoryBlobMap = new Map<string, Blob>();
const activeObjectUrls = new Map<string, string>();

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeMediaBlob(mediaId: string, blob: Blob): Promise<void> {
  memoryBlobMap.set(mediaId, blob);
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, mediaId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Graceful fallback to memoryMap if IndexedDB is blocked or unsupported
  }
}

export async function getMediaBlob(mediaId: string): Promise<Blob | null> {
  if (memoryBlobMap.has(mediaId)) {
    return memoryBlobMap.get(mediaId) || null;
  }

  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(mediaId);
      req.onsuccess = () => {
        const result = req.result as Blob | undefined;
        if (result) {
          memoryBlobMap.set(mediaId, result);
        }
        resolve(result || null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return memoryBlobMap.get(mediaId) || null;
  }
}

export async function getOrRehydrateObjectUrl(mediaId: string): Promise<string | null> {
  if (activeObjectUrls.has(mediaId)) {
    return activeObjectUrls.get(mediaId)!;
  }

  const blob = await getMediaBlob(mediaId);
  if (!blob) return null;

  if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
    const freshUrl = URL.createObjectURL(blob);
    activeObjectUrls.set(mediaId, freshUrl);
    return freshUrl;
  }

  return null;
}
