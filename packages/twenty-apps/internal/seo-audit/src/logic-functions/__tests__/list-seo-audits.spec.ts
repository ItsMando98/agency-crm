import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock };
  }),
}));

import listSeoAudits from 'src/logic-functions/list-seo-audits';

const handler = listSeoAudits.config.handler as (parameters: {
  companyId?: string;
  domain?: string;
  status?: string;
  limit?: number;
}) => Promise<{ success: boolean; message: string; audits: { id: string; score: number | null }[] }>;

describe('list_seo_audits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMock.mockResolvedValue({
      seoAudits: { edges: [{ node: { id: 'a1', score: 80, status: 'DONE' } }, { node: { id: 'a2', score: null } }] },
    });
  });

  it('returns the audits as summaries', async () => {
    const result = await handler({});

    expect(result.success).toBe(true);
    expect(result.audits.map((audit) => audit.id)).toEqual(['a1', 'a2']);
  });

  it('says so when nothing matches', async () => {
    queryMock.mockResolvedValue({ seoAudits: { edges: [] } });

    expect(await handler({})).toMatchObject({ message: 'No audits found', audits: [] });
  });

  it('orders newest first and applies the default limit', async () => {
    await handler({});

    const args = queryMock.mock.calls[0][0].seoAudits.__args;

    expect(args.orderBy).toEqual([{ createdAt: 'DescNullsLast' }]);
    expect(args.first).toBe(10);
    expect(args.filter).toEqual({});
  });

  it('builds filters from the inputs', async () => {
    await handler({ companyId: 'c1', domain: 'https://www.example.com', status: 'DONE', limit: 500 });

    const args = queryMock.mock.calls[0][0].seoAudits.__args;

    expect(args.filter).toEqual({
      companyId: { eq: 'c1' },
      domain: { ilike: '%example.com%' },
      status: { eq: 'DONE' },
    });
    expect(args.first).toBe(50);
  });
});
