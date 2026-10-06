import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock };
  }),
}));

import compareSeoAudits from 'src/logic-functions/compare-seo-audits';

const handler = compareSeoAudits.config.handler as (parameters: {
  auditId: string;
  previousAuditId?: string;
}) => Promise<{
  success: boolean;
  error?: string;
  current?: { id: string };
  previous?: { id: string };
  comparison?: { score: { delta: number | null }; resolvedTasks: { ruleId: string }[] };
}>;

const auditResponse = (node: Record<string, unknown> | null) => ({
  seoAudits: { edges: node === null ? [] : [{ node }] },
});

const tasksResponse = (ruleIds: string[]) => ({
  seoAuditTasks: {
    edges: ruleIds.map((ruleId) => ({ node: { ruleId, name: ruleId, priority: 'HIGH' } })),
  },
});

const current = {
  id: 'a2',
  domain: 'https://example.com',
  status: 'DONE',
  score: 80,
  createdAt: '2026-10-02T10:00:00.000Z',
};
const previous = { ...current, id: 'a1', score: 65, createdAt: '2026-09-02T10:00:00.000Z' };

describe('compare_seo_audits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reports an unknown audit', async () => {
    queryMock.mockResolvedValueOnce(auditResponse(null));

    expect(await handler({ auditId: 'nope' })).toMatchObject({ success: false });
  });

  it('refuses an audit that is not finished', async () => {
    queryMock
      .mockResolvedValueOnce(auditResponse({ ...current, status: 'RUNNING' }))
      .mockResolvedValueOnce(tasksResponse([]));

    expect(await handler({ auditId: 'a2' })).toMatchObject({ success: false, error: 'Status is RUNNING' });
  });

  it('compares with the latest earlier audit of the same website', async () => {
    queryMock
      .mockResolvedValueOnce(auditResponse(current))
      .mockResolvedValueOnce(tasksResponse(['TITLE_MISSING']))
      .mockResolvedValueOnce(auditResponse(previous))
      .mockResolvedValueOnce(tasksResponse(['TITLE_MISSING', 'IMG_ALT']));

    const result = await handler({ auditId: 'a2' });

    expect(result.success).toBe(true);
    expect(result.previous?.id).toBe('a1');
    expect(result.comparison?.score.delta).toBe(15);
    expect(result.comparison?.resolvedTasks).toEqual([{ ruleId: 'IMG_ALT', name: 'IMG_ALT', priority: 'HIGH' }]);

    const previousQuery = queryMock.mock.calls[2][0].seoAudits.__args;

    expect(previousQuery.filter).toEqual({
      domain: { eq: 'https://example.com' },
      status: { eq: 'DONE' },
      createdAt: { lt: current.createdAt },
    });
    expect(previousQuery.orderBy).toEqual([{ createdAt: 'DescNullsLast' }]);
  });

  it('uses the given previous audit', async () => {
    queryMock
      .mockResolvedValueOnce(auditResponse(current))
      .mockResolvedValueOnce(tasksResponse([]))
      .mockResolvedValueOnce(auditResponse(previous))
      .mockResolvedValueOnce(tasksResponse([]));

    await handler({ auditId: 'a2', previousAuditId: 'a1' });

    expect(queryMock.mock.calls[2][0].seoAudits.__args.filter).toEqual({ id: { eq: 'a1' } });
  });

  it('says so when there is nothing to compare with', async () => {
    queryMock
      .mockResolvedValueOnce(auditResponse(current))
      .mockResolvedValueOnce(tasksResponse([]))
      .mockResolvedValueOnce(auditResponse(null));

    expect(await handler({ auditId: 'a2' })).toMatchObject({ success: false, error: 'No previous audit' });
  });
});
