import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock };
  }),
}));

import listSeoKeywords from 'src/logic-functions/list-seo-keywords';

const handler = listSeoKeywords.config.handler as (parameters: {
  auditId: string;
  category?: string;
  minSearchVolume?: number;
  limit?: number;
}) => Promise<{ success: boolean; message: string; keywords: unknown[] }>;

describe('list_seo_keywords', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMock.mockResolvedValue({
      seoKeywordOpportunities: { edges: [{ node: { keyword: 'seo agentur', position: 12, searchVolume: 900 } }] },
    });
  });

  it('returns the keywords sorted by search volume', async () => {
    const result = await handler({ auditId: 'a1' });

    expect(result.keywords).toEqual([{ keyword: 'seo agentur', position: 12, searchVolume: 900 }]);
    expect(queryMock.mock.calls[0][0].seoKeywordOpportunities.__args).toMatchObject({
      filter: { seoAuditId: { eq: 'a1' } },
      orderBy: [{ searchVolume: 'DescNullsLast' }],
      first: 25,
    });
  });

  it('applies category, volume and limit', async () => {
    await handler({ auditId: 'a1', category: 'QUICK_WIN', minSearchVolume: 100, limit: 1000 });

    const args = queryMock.mock.calls[0][0].seoKeywordOpportunities.__args;

    expect(args.filter).toEqual({
      seoAuditId: { eq: 'a1' },
      category: { eq: 'QUICK_WIN' },
      searchVolume: { gte: 100 },
    });
    expect(args.first).toBe(100);
  });

  it('points to DataForSEO when there are no keywords', async () => {
    queryMock.mockResolvedValue({ seoKeywordOpportunities: { edges: [] } });

    const result = await handler({ auditId: 'a1' });

    expect(result.keywords).toEqual([]);
    expect(result.message).toContain('DataForSEO');
  });
});
