import { describe, expect, it } from 'vitest';

import { buildDataForSeoEnvelope } from 'src/__mocks__/build-dataforseo-envelope.mock';
import { createRecordingFetch } from 'src/__mocks__/create-recording-fetch.mock';
import { DataForSeoError } from 'src/dataforseo-client/dataforseo-error';
import { requestDataForSeo } from 'src/dataforseo-client/request-dataforseo';

const CREDENTIALS = { login: 'agency@example.com', password: 'api-secret' };

describe('requestDataForSeo', () => {
  it('sends basic auth and the body, and returns the first result with the cost', async () => {
    const { fetchImplementation, requests } = createRecordingFetch(() => ({
      json: buildDataForSeoEnvelope({ value: 1 }, { cost: 0.06 }),
    }));

    const response = await requestDataForSeo({
      credentials: CREDENTIALS,
      path: '/v3/test/live',
      body: [{ target: 'example.com' }],
      fetchImplementation,
    });

    expect(response).toEqual({ result: { value: 1 }, cost: 0.06 });
    expect(requests[0]).toMatchObject({
      url: 'https://api.dataforseo.com/v3/test/live',
      method: 'POST',
      authorization: `Basic ${btoa('agency@example.com:api-secret')}`,
      body: [{ target: 'example.com' }],
    });
  });

  it('uses GET when there is no body', async () => {
    const { fetchImplementation, requests } = createRecordingFetch(() => ({
      json: buildDataForSeoEnvelope({ login: 'x' }),
    }));

    await requestDataForSeo({ credentials: CREDENTIALS, path: '/v3/appendix/user_data', fetchImplementation });

    expect(requests[0].method).toBe('GET');
  });

  it('maps an HTTP 401 to an authentication error', async () => {
    const { fetchImplementation } = createRecordingFetch(() => ({
      status: 401,
      json: { status_code: 40100, status_message: 'You are not authorized' },
    }));

    await expect(
      requestDataForSeo({ credentials: CREDENTIALS, path: '/v3/x', fetchImplementation }),
    ).rejects.toMatchObject({ kind: 'AUTHENTICATION', message: 'You are not authorized' });
  });

  it('maps a failing task code inside a 200 response', async () => {
    const { fetchImplementation } = createRecordingFetch(() => ({
      json: buildDataForSeoEnvelope(null, {
        taskStatusCode: 40204,
        statusMessage: 'Access denied. Visit the pricing page.',
      }),
    }));

    const request = requestDataForSeo({ credentials: CREDENTIALS, path: '/v3/x', fetchImplementation });

    await expect(request).rejects.toBeInstanceOf(DataForSeoError);
    await expect(request).rejects.toMatchObject({ message: 'Access denied. Visit the pricing page.' });
  });

  it('rejects a response without tasks', async () => {
    const { fetchImplementation } = createRecordingFetch(() => ({ json: { status_code: 20000 } }));

    await expect(
      requestDataForSeo({ credentials: CREDENTIALS, path: '/v3/x', fetchImplementation }),
    ).rejects.toMatchObject({ kind: 'OTHER' });
  });

  it('returns a null result when the task has none', async () => {
    const { fetchImplementation } = createRecordingFetch(() => ({
      json: buildDataForSeoEnvelope(null),
    }));

    expect((await requestDataForSeo({ credentials: CREDENTIALS, path: '/v3/x', fetchImplementation })).result).toBeNull();
  });
});
