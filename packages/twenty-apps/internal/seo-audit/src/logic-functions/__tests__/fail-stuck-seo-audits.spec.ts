import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, mutationMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  mutationMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock, mutation: mutationMock };
  }),
}));

import failStuckSeoAudits from 'src/logic-functions/fail-stuck-seo-audits';

const handler = failStuckSeoAudits.config.handler as () => Promise<void>;

describe('fail-stuck-seo-audits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutationMock.mockResolvedValue({});
  });

  it('marks old queued or running audits as failed', async () => {
    queryMock.mockResolvedValue({
      seoAudits: {
        edges: [
          {
            node: {
              id: 'a',
              domain: 'https://example.com',
              status: 'QUEUED',
              createdAt: '2020-01-01T00:00:00.000Z',
            },
          },
          {
            node: {
              id: 'b',
              domain: 'https://example.com',
              status: 'RUNNING',
              createdAt: '2020-01-01T00:00:00.000Z',
              startedAt: '2020-01-01T00:00:00.000Z',
            },
          },
        ],
      },
    });

    await handler();

    const filter = queryMock.mock.calls[0][0].seoAudits.__args.filter;

    expect(filter.status).toEqual({ in: ['RUNNING', 'QUEUED'] });
    expect(mutationMock).toHaveBeenCalledTimes(2);
    expect(mutationMock.mock.calls[0][0].updateSeoAudit.__args).toMatchObject({
      id: 'a',
      data: { status: 'FAILED' },
    });
  });

  it('does nothing when no audit is stuck', async () => {
    queryMock.mockResolvedValue({ seoAudits: { edges: [] } });

    await handler();

    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('leaves a draft with no website queued', async () => {
    queryMock.mockResolvedValue({
      seoAudits: {
        edges: [
          {
            node: {
              id: 'draft',
              domain: '',
              status: 'QUEUED',
              createdAt: '2020-01-01T00:00:00.000Z',
            },
          },
        ],
      },
    });

    await handler();

    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('does not fail a retry that started again recently', async () => {
    queryMock.mockResolvedValue({
      seoAudits: {
        edges: [
          {
            node: {
              id: 'retry',
              domain: 'https://example.com',
              status: 'RUNNING',
              createdAt: '2020-01-01T00:00:00.000Z',
              startedAt: new Date().toISOString(),
            },
          },
        ],
      },
    });

    await handler();

    expect(mutationMock).not.toHaveBeenCalled();
  });
});
