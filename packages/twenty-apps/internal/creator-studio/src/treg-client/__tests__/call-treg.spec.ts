import { describe, expect, it } from 'vitest';

import { createRecordingFetch } from 'src/__mocks__/create-recording-fetch.mock';
import { callTreg, TregError } from 'src/treg-client/call-treg';

const credentials = { token: 'agent-token', organization: null };

describe('callTreg', () => {
  it('posts with the token, the cost cap and reads the cost header', async () => {
    const { fetchImplementation, requests } = createRecordingFetch(() => ({
      json: { id: 'task-1' },
      headers: { 'x-treg-cost-micro': '30000' },
    }));

    const result = await callTreg({
      credentials: { token: 'agent-token', organization: 'landoo' },
      endpointId: 'reapi.image-gen.gemini-3-pro-image',
      body: { prompt: 'x' },
      maxCostUsd: 0.1,
      fetchImplementation,
    });

    expect(result).toEqual({ body: { id: 'task-1' }, costUsd: 0.03 });
    expect(requests[0]?.url).toBe('https://treg.to/call/reapi.image-gen.gemini-3-pro-image');
    expect(requests[0]?.headers['x-treg-token']).toBe('agent-token');
    expect(requests[0]?.headers['x-treg-org']).toBe('landoo');
    expect(requests[0]?.headers['x-treg-route-max-cost']).toBe('0.1');
  });

  it('puts query parameters in the url for a GET', async () => {
    const { fetchImplementation, requests } = createRecordingFetch(() => ({ json: {} }));

    await callTreg({
      credentials,
      endpointId: 'reapi.tasks.get',
      method: 'GET',
      query: { id: 'task_1' },
      fetchImplementation,
    });

    expect(requests[0]?.url).toBe('https://treg.to/call/reapi.tasks.get?id=task_1');
    expect(requests[0]?.method).toBe('GET');
    expect(requests[0]?.body).toBeUndefined();
  });

  it.each([
    [401, {}, /rejected the token/],
    [402, { topup_url: 'https://treg.to/topup' }, /Top up at https:\/\/treg.to\/topup/],
    [503, { error: 'treg_saturated' }, /busy or the provider is unavailable \(treg_saturated\)/],
  ])('explains HTTP %i', async (status, json, message) => {
    const { fetchImplementation } = createRecordingFetch(() => ({ status, json }));

    await expect(
      callTreg({ credentials, endpointId: 'x', fetchImplementation }),
    ).rejects.toThrow(message);
    await expect(
      callTreg({ credentials, endpointId: 'x', fetchImplementation }),
    ).rejects.toBeInstanceOf(TregError);
  });
});
