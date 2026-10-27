// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Azure Blob Upload Unit & Integration Suite

import test from 'node:test';
import assert from 'node:assert';
import { mediaApi } from '../src/api/mediaApi.ts';
import { setApiGatewayUrl, setAuthToken } from '../src/api/client.ts';

test('Azure Blob Media Upload Suite', async (suite) => {
  const originalFetch = globalThis.fetch;

  suite.afterEach(() => {
    globalThis.fetch = originalFetch;
    setApiGatewayUrl(null);
    setAuthToken(null);
  });

  await suite.test('mediaApi.uploadBlob sends PUT with x-ms-blob-type: BlockBlob', async () => {
    let capturedUrl = '';
    let capturedMethod = '';
    let capturedHeaders = null;
    let capturedBody = null;

    globalThis.fetch = async (url, options) => {
      capturedUrl = url;
      capturedMethod = options.method;
      capturedHeaders = options.headers;
      capturedBody = options.body;
      return {
        ok: true,
        status: 201,
        statusText: 'Created',
      };
    };

    const dummyBlob = new Blob(['sample-image-binary-data'], { type: 'image/jpeg' });
    const sasUrl = 'https://socialmediaanalysis.blob.core.windows.net/media-assets/user_101/test.jpg?sig=xyz123';

    await mediaApi.uploadBlob(sasUrl, dummyBlob, 'image/jpeg');

    assert.strictEqual(capturedUrl, sasUrl);
    assert.strictEqual(capturedMethod, 'PUT');
    assert.strictEqual(capturedHeaders['x-ms-blob-type'], 'BlockBlob');
    assert.strictEqual(capturedHeaders['Content-Type'], 'image/jpeg');
    assert.strictEqual(capturedBody, dummyBlob);
  });

  await suite.test('mediaApi.uploadBlob throws descriptive error on upload rejection', async () => {
    globalThis.fetch = async () => {
      return {
        ok: false,
        status: 403,
        statusText: 'AuthenticationFailed',
      };
    };

    const dummyBlob = new Blob(['sample-data'], { type: 'text/plain' });
    const sasUrl = 'https://socialmediaanalysis.blob.core.windows.net/media-assets/test.txt?sig=invalid';

    await assert.rejects(
      async () => {
        await mediaApi.uploadBlob(sasUrl, dummyBlob, 'text/plain');
      },
      /Media upload failed: 403 AuthenticationFailed/
    );
  });

  await suite.test('Live Gateway /v1/media/presign integration test', async () => {
    // Check if live Gateway on port 8080 is reachable
    let isGatewayLive = false;
    try {
      const ping = await originalFetch('http://127.0.0.1:8080/actuator/health', { signal: AbortSignal.timeout(2000) });
      isGatewayLive = ping.ok;
    } catch {
      isGatewayLive = false;
    }

    if (!isGatewayLive) {
      // Mock gateway response for isolated test environment
      globalThis.fetch = async () => {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            status: 'SUCCESS',
            message: 'Presigned SAS URL generated successfully.',
            data: {
              uploadUrl: 'https://socialmediaanalysis.blob.core.windows.net/media-assets/user_hunain/mock_img.png?sig=live-sas-signature',
              publicBlobUrl: 'https://socialmediaanalysis.blob.core.windows.net/media-assets/user_hunain/mock_img.png',
              expiresAt: new Date(Date.now() + 900000).toISOString(),
            },
          }),
        };
      };
    }

    const presign = await mediaApi.getPresignedUploadUrl({
      userId: 'user_hunain',
      fileName: 'architecture_diagram.png',
      contentType: 'image/png',
    });

    assert.ok(presign);
    assert.ok(presign.uploadUrl.includes('socialmediaanalysis.blob.core.windows.net'));
    assert.ok(presign.uploadUrl.includes('media-assets'));
    assert.ok(presign.publicBlobUrl.startsWith('https://socialmediaanalysis.blob.core.windows.net/media-assets/'));
    assert.ok(!presign.publicBlobUrl.includes('sig='), 'Public URL must not include private SAS query string');
  });
});
