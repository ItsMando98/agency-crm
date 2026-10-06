import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock };
  }),
}));

import seoAuditReportRoute from 'src/logic-functions/seo-audit-report-route';

type Event = Parameters<typeof seoAuditReportRoute.config.handler>[0];

const handler = seoAuditReportRoute.config.handler as (
  event: Event,
) => Promise<{ body: unknown; status?: number; headers?: Record<string, string> }>;

const request = (query: Record<string, string>) => ({ queryStringParameters: query }) as unknown as Event;

const storedAudit = (overrides: Record<string, unknown> = {}) => ({
  seoAudits: {
    edges: [{ node: { id: 'audit-1', reportHtml: '<html>report</html>', shareToken: 'secret-token', ...overrides } }],
  },
});

describe('seo-audit-report route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('serves the stored report for the right token', async () => {
    queryMock.mockResolvedValue(storedAudit());

    const response = await handler(request({ id: 'audit-1', token: 'secret-token' }));

    expect(response.status).toBe(200);
    expect(response.body).toBe('<html>report</html>');
    expect(response.headers).toEqual({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
    });
    expect(queryMock.mock.calls[0][0].seoAudits.__args.filter).toEqual({ id: { eq: 'audit-1' } });
  });

  it.each([
    ['a wrong token', { id: 'audit-1', token: 'wrong-token' }],
    ['a token of a different length', { id: 'audit-1', token: 'x' }],
    ['a missing token', { id: 'audit-1' }],
    ['a missing id', { token: 'secret-token' }],
  ])('answers 404 for %s', async (_label, query) => {
    queryMock.mockResolvedValue(storedAudit());

    const response = await handler(request(query));

    expect(response.status).toBe(404);
    expect(response.body).toBe('Not found');
  });

  it('answers the same 404 when the audit does not exist, has no report or no token', async () => {
    for (const result of [
      { seoAudits: { edges: [] } },
      storedAudit({ reportHtml: null }),
      storedAudit({ shareToken: '' }),
      storedAudit({ shareToken: null }),
    ]) {
      queryMock.mockResolvedValue(result);

      const response = await handler(request({ id: 'audit-1', token: 'secret-token' }));

      expect(response.status).toBe(404);
      expect(response.body).toBe('Not found');
    }
  });

  it('is a public GET route so a client can open the link without an account', () => {
    expect(seoAuditReportRoute.config.httpRouteTriggerSettings).toMatchObject({
      path: '/seo-audit/report',
      httpMethod: 'GET',
      isAuthRequired: false,
    });
  });
});
