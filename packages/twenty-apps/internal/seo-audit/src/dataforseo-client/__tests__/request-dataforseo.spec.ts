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

  it('says that the balance is used up on an HTTP 402', async () => {
    const { fetchImplementation } = createRecordingFetch(() => ({
      status: 402,
      json: { status_code: 40200, status_message: 'Payment Required.', tasks: null },
    }));

    await expect(
      requestDataForSeo({ credentials: CREDENTIALS, path: '/v3/x', fetchImplementation }),
    ).rejects.toMatchObject({
      kind: 'PAYMENT',
      message: 'The DataForSEO balance is used up (Payment Required, code 40200). Top up the account.',
    });
  });

  it('says that the balance is used up when the payment error sits inside a 200 response', async () => {
    const { fetchImplementation } = createRecordingFetch(() => ({
      json: buildDataForSeoEnvelope(null, { taskStatusCode: 40200, statusMessage: 'Payment Required.' }),
    }));

    await expect(
      requestDataForSeo({ credentials: CREDENTIALS, path: '/v3/x', fetchImplementation }),
    ).rejects.toMatchObject({
      kind: 'PAYMENT',
      message: 'The DataForSEO balance is used up (Payment Required, code 40200). Top up the account.',
    });
  });

  it('explains an answer that carries no task instead of repeating "Ok."', async () => {
    const { fetchImplementation } = createRecordingFetch(() => ({
      json: { status_code: 20000, status_message: 'Ok.', tasks: null },
    }));

    await expect(
      requestDataForSeo({ credentials: CREDENTIALS, path: '/v3/x', fetchImplementation }),
    ).rejects.toMatchObject({
      kind: 'OTHER',
      message: 'DataForSEO returned no task for this request. The account balance may be used up.',
    });
  });

  it('adds the code when the message says nothing', async () => {
    const { fetchImplementation } = createRecordingFetch(() => ({
      json: buildDataForSeoEnvelope(null, { taskStatusCode: 50000, statusMessage: 'Ok.' }),
    }));

    await expect(
      requestDataForSeo({ credentials: CREDENTIALS, path: '/v3/x', fetchImplementation }),
    ).rejects.toMatchObject({ message: 'DataForSEO error code 50000' });
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
