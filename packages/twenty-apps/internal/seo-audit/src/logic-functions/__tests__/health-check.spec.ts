import Anthropic from '@anthropic-ai/sdk';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getAnthropicClientMock } = vi.hoisted(() => ({
  getAnthropicClientMock: vi.fn(),
}));

vi.mock('src/utils/get-anthropic-client.util', () => ({
  getAnthropicClient: getAnthropicClientMock,
}));

import healthCheck from 'src/logic-functions/health-check';

const handler = healthCheck.config.handler as () => Promise<{ status: string; title?: string }>;

const clientWith = (list: () => Promise<unknown>) => ({ models: { list } });

describe('health check', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('warns when no key is configured', async () => {
    getAnthropicClientMock.mockReturnValue(null);

    expect(await handler()).toMatchObject({
      status: 'WARNING',
      title: 'Anthropic API key missing',
    });
  });

  it('is healthy when Anthropic accepts the key', async () => {
    getAnthropicClientMock.mockReturnValue(clientWith(async () => ({ data: [] })));

    expect(await handler()).toEqual({ status: 'OK' });
  });

  it('reports a rejected key as an error', async () => {
    getAnthropicClientMock.mockReturnValue(
      clientWith(async () => {
        throw Anthropic.APIError.generate(401, { error: { message: 'invalid' } }, 'invalid', new Headers());
      }),
    );

    expect(await handler()).toMatchObject({ status: 'ERROR', title: 'Anthropic API key rejected' });
  });

  it('lets unrelated failures bubble up so the status stays unknown', async () => {
    getAnthropicClientMock.mockReturnValue(
      clientWith(async () => {
        throw new Error('network down');
      }),
    );

    await expect(handler()).rejects.toThrow('network down');
  });
});
