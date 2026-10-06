import Anthropic from '@anthropic-ai/sdk';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getAnthropicClientMock, readCredentialsMock, checkCredentialsMock } = vi.hoisted(() => ({
  getAnthropicClientMock: vi.fn(),
  readCredentialsMock: vi.fn(),
  checkCredentialsMock: vi.fn(),
}));

vi.mock('src/utils/get-anthropic-client.util', () => ({
  getAnthropicClient: getAnthropicClientMock,
}));
vi.mock('src/utils/read-dataforseo-credentials.util', () => ({
  readDataForSeoCredentials: readCredentialsMock,
}));
vi.mock('src/dataforseo-client/check-dataforseo-credentials', () => ({
  checkDataForSeoCredentials: checkCredentialsMock,
}));

import { DataForSeoError } from 'src/dataforseo-client/dataforseo-error';
import healthCheck from 'src/logic-functions/health-check';

const handler = healthCheck.config.handler as () => Promise<{ status: string; title?: string }>;

const healthyAnthropic = () => ({ models: { list: async () => ({ data: [] }) } });

describe('health check', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAnthropicClientMock.mockReturnValue(healthyAnthropic());
    readCredentialsMock.mockReturnValue(null);
  });

  it('warns when no Anthropic key is configured', async () => {
    getAnthropicClientMock.mockReturnValue(null);

    expect(await handler()).toMatchObject({ status: 'WARNING', title: 'Anthropic API key missing' });
  });

  it('is healthy when Anthropic accepts the key and DataForSEO is not configured', async () => {
    expect(await handler()).toEqual({ status: 'OK' });
    expect(checkCredentialsMock).not.toHaveBeenCalled();
  });

  it('reports a rejected Anthropic key as an error', async () => {
    getAnthropicClientMock.mockReturnValue({
      models: {
        list: async () => {
          throw Anthropic.APIError.generate(401, { error: { message: 'invalid' } }, 'invalid', new Headers());
        },
      },
    });

    expect(await handler()).toMatchObject({ status: 'ERROR', title: 'Anthropic API key rejected' });
  });

  it('lets unrelated Anthropic failures bubble up so the status stays unknown', async () => {
    getAnthropicClientMock.mockReturnValue({
      models: {
        list: async () => {
          throw new Error('network down');
        },
      },
    });

    await expect(handler()).rejects.toThrow('network down');
  });

  it('is healthy when DataForSEO accepts the credentials and has funds', async () => {
    readCredentialsMock.mockReturnValue({ login: 'a', password: 'b' });
    checkCredentialsMock.mockResolvedValue({ balance: 25 });

    expect(await handler()).toEqual({ status: 'OK' });
  });

  it('warns when the DataForSEO balance is low', async () => {
    readCredentialsMock.mockReturnValue({ login: 'a', password: 'b' });
    checkCredentialsMock.mockResolvedValue({ balance: 0.4 });

    expect(await handler()).toMatchObject({ status: 'WARNING', title: 'DataForSEO balance is low' });
  });

  it('reports rejected DataForSEO credentials as an error and prefers it over warnings', async () => {
    getAnthropicClientMock.mockReturnValue(null);
    readCredentialsMock.mockReturnValue({ login: 'a', password: 'b' });
    checkCredentialsMock.mockRejectedValue(new DataForSeoError('AUTHENTICATION', 'Authentication failed'));

    expect(await handler()).toMatchObject({ status: 'ERROR', title: 'DataForSEO credentials rejected' });
  });

  it('returns a known issue even when the other check could not run', async () => {
    getAnthropicClientMock.mockReturnValue(null);
    readCredentialsMock.mockReturnValue({ login: 'a', password: 'b' });
    checkCredentialsMock.mockRejectedValue(new Error('timeout'));

    expect(await handler()).toMatchObject({ status: 'WARNING', title: 'Anthropic API key missing' });
  });

  it('keeps the status unknown when a check fails and nothing else is wrong', async () => {
    readCredentialsMock.mockReturnValue({ login: 'a', password: 'b' });
    checkCredentialsMock.mockRejectedValue(new Error('timeout'));

    await expect(handler()).rejects.toThrow('timeout');
  });
});
