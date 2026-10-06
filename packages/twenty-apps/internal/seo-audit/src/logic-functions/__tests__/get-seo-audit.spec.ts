import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock };
  }),
}));

import getSeoAudit from 'src/logic-functions/get-seo-audit';
import { type GetSeoAuditInput } from 'src/types/get-seo-audit-input';

const handler = getSeoAudit.config.handler as (parameters: GetSeoAuditInput) => Promise<{
  success: boolean;
  message: string;
  audit?: Record<string, unknown>;
  topTasks?: { name: string }[];
  keywordOpportunities?: unknown[];
  reportMarkdown?: string;
}>;

const audit = (status: string) => ({
  seoAudits: { edges: [{ node: { id: 'audit-1', status, score: 81, reportMarkdown: '# Report' } }] },
});

describe('get_seo_audit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reports an unknown audit', async () => {
    queryMock.mockResolvedValueOnce({ seoAudits: { edges: [] } });

    expect(await handler({ auditId: 'nope' })).toMatchObject({ success: false });
  });

  it('returns only the status while the audit is not finished', async () => {
    queryMock.mockResolvedValueOnce(audit('RUNNING'));

    const result = await handler({ auditId: 'audit-1' });

    expect(result.success).toBe(true);
    expect(result.message).toContain('not finished');
    expect(result.reportMarkdown).toBeUndefined();
    expect(queryMock).toHaveBeenCalledTimes(1);
  });

  it('returns score, most important tasks and report for a finished audit', async () => {
    queryMock.mockResolvedValueOnce(audit('DONE')).mockResolvedValueOnce({
      seoAuditTasks: {
        edges: [
          { node: { id: 't1', name: 'low', priority: 'LOW' } },
          { node: { id: 't2', name: 'critical', priority: 'CRITICAL' } },
          { node: { id: 't3', name: 'high', priority: 'HIGH' } },
        ],
      },
    }).mockResolvedValueOnce({
      seoKeywordOpportunities: {
        edges: [{ node: { keyword: 'kündigungsfrist', position: 17, searchVolume: 60000 } }],
      },
    });

    const result = await handler({ auditId: 'audit-1' });

    expect(result.topTasks?.map((task) => task.name)).toEqual(['critical', 'high', 'low']);
    expect(result.reportMarkdown).toBe('# Report');
    expect(result.audit).not.toHaveProperty('reportMarkdown');
    expect(result.keywordOpportunities).toEqual([
      { keyword: 'kündigungsfrist', position: 17, searchVolume: 60000 },
    ]);
    expect(queryMock.mock.calls[2][0].seoKeywordOpportunities.__args.filter.category).toEqual({
      in: ['QUICK_WIN', 'NEAR_PAGE_ONE'],
    });
  });

  it('leaves out the report when includeReport is false', async () => {
    queryMock
      .mockResolvedValueOnce(audit('DONE'))
      .mockResolvedValueOnce({ seoAuditTasks: { edges: [] } })
      .mockResolvedValueOnce({ seoKeywordOpportunities: { edges: [] } });

    const result = await handler({ auditId: 'audit-1', includeReport: false });

    expect(result.reportMarkdown).toBeUndefined();
    expect(result.audit).toMatchObject({ id: 'audit-1', score: 81 });
  });
});
