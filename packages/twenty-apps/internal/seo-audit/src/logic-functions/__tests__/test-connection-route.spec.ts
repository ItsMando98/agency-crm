import { beforeEach, describe, expect, it, vi } from 'vitest';

const { runConnectionTestMock } = vi.hoisted(() => ({ runConnectionTestMock: vi.fn() }));

vi.mock('src/connection-test/run-connection-test', () => ({
  runConnectionTest: runConnectionTestMock,
}));

import testConnectionRoute from 'src/logic-functions/test-connection-route';

type Event = Parameters<typeof testConnectionRoute.config.handler>[0];

const handler = testConnectionRoute.config.handler as (event: Event) => Promise<unknown>;
const request = (query: Record<string, string>) => ({ queryStringParameters: query }) as unknown as Event;

describe('test-connection route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('runs the test for the requested service and returns its result', async () => {
    runConnectionTestMock.mockResolvedValue({ status: 'OK', message: 'Token accepted.' });

    const response = await handler(request({ service: 'TREG' }));

    expect(runConnectionTestMock).toHaveBeenCalledWith({ service: 'TREG' });
    expect(response).toEqual({ status: 'OK', message: 'Token accepted.' });
  });

  it('refuses an unknown service without testing anything', async () => {
    const response = await handler(request({ service: 'SOMETHING' }));

    expect(runConnectionTestMock).not.toHaveBeenCalled();
    expect(response).toEqual({ status: 'FAILED', message: 'Unknown service.' });
  });

  it('returns a failure instead of throwing when the test itself breaks', async () => {
    runConnectionTestMock.mockRejectedValue(new Error('boom'));

    const response = await handler(request({ service: 'ANTHROPIC' }));

    expect(response).toEqual({ status: 'FAILED', message: 'The test could not be run: boom' });
  });

  it('is an authenticated GET route, because a test spends the saved keys', () => {
    expect(testConnectionRoute.config.httpRouteTriggerSettings).toMatchObject({
      path: '/seo-audit/test-connection',
      httpMethod: 'GET',
      isAuthRequired: true,
    });
  });
});
