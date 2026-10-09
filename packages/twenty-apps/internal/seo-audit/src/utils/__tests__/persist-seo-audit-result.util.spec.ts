import { describe, expect, it, vi } from 'vitest';

import { buildCrawledPage } from 'src/__mocks__/build-crawled-page.mock';
import { buildScoredKeyword } from 'src/__mocks__/build-scored-keyword.mock';
import { persistSeoAuditResult } from 'src/utils/persist-seo-audit-result.util';
import { type SeoAuditResult } from 'src/types/seo-audit-result';

const buildResult = (overrides: Partial<SeoAuditResult> = {}): SeoAuditResult => ({
  origin: 'https://example.com',
  language: 'EN',
  generatedAt: '2026-10-06T10:00:00.000Z',
  brokenBacklinkTargets: [],
  score: 81,
  grade: 'B',
  areaScores: { SECURITY: 98 },
  pages: [buildCrawledPage({ url: 'https://example.com/' })],
  assessments: [],
  tasks: [
    {
      ruleId: 'TITLE_MISSING',
      name: '1 pages without a title tag',
      description: 'Fix',
      priority: 'HIGH',
      effort: 'LOW',
      area: 'ON_PAGE',
      source: 'RULE',
      affectedUrls: ['https://example.com/a'],
    },
  ],
  marketData: null,
  keywords: [],
  reportMarkdown: '# Report',
  ...overrides,
});

const lastUpdateData = (mutation: { mock: { calls: unknown[][] } }) => {
  const { calls } = mutation.mock;

  return (calls[calls.length - 1][0] as { updateSeoAudit: { __args: { data: Record<string, unknown> } } })
    .updateSeoAudit.__args.data;
};

const buildClient = () => {
  const mutation = vi.fn().mockResolvedValue({});

  return { client: { mutation } as never, mutation };
};

describe('persistSeoAuditResult', () => {
  it('creates pages and tasks, then marks the audit as done', async () => {
    const { client, mutation } = buildClient();

    await persistSeoAuditResult({
      client,
      auditId: 'audit-1',
      result: buildResult(),
      finishedAt: new Date('2026-10-06T10:00:00Z'),
    });

    const calls = mutation.mock.calls.map(([payload]) => Object.keys(payload)[0]);

    expect(calls).toEqual(['createSeoAuditPages', 'createSeoAuditTasks', 'updateSeoAudit']);
    expect(mutation.mock.calls[2][0].updateSeoAudit.__args).toEqual({
      id: 'audit-1',
      data: expect.objectContaining({
        status: 'DONE',
        score: 81,
        grade: 'B',
        pagesCrawled: 1,
        areaScores: { SECURITY: 98 },
        reportMarkdown: '# Report',
        finishedAt: '2026-10-06T10:00:00.000Z',
      }),
    });
  });

  it('skips creating empty batches', async () => {
    const { client, mutation } = buildClient();

    await persistSeoAuditResult({
      client,
      auditId: 'audit-1',
      result: buildResult({ pages: [], tasks: [] }),
      finishedAt: new Date(),
    });

    expect(mutation).toHaveBeenCalledTimes(1);
  });

  it('stores keyword opportunities and market data fields', async () => {
    const { client, mutation } = buildClient();

    await persistSeoAuditResult({
      client,
      auditId: 'audit-1',
      result: buildResult({
        keywords: [buildScoredKeyword({ keyword: 'kündigungsfrist' })],
        marketData: {
          rankings: { totalKeywords: 6500, estimatedMonthlyTraffic: 54000, positionCounts: null, keywords: [] },
          backlinks: null,
          backlinkTargets: [],
          lighthouse: null,
          competitors: [],
          costUsd: 0.31,
          notes: [],
        },
      }),
      finishedAt: new Date('2026-10-06T10:00:00Z'),
    });

    const calls = mutation.mock.calls.map(([payload]) => Object.keys(payload)[0]);

    expect(calls).toEqual([
      'createSeoAuditPages',
      'createSeoAuditTasks',
      'createSeoKeywordOpportunities',
      'updateSeoAudit',
    ]);
    expect(mutation.mock.calls[2][0].createSeoKeywordOpportunities.__args.data[0]).toMatchObject({
      seoAuditId: 'audit-1',
      keyword: 'kündigungsfrist',
      category: 'NEAR_PAGE_ONE',
    });
    expect(mutation.mock.calls[3][0].updateSeoAudit.__args.data).toMatchObject({
      organicKeywordCount: 6500,
      estimatedMonthlyTraffic: 54000,
      marketDataCostUsd: 0.31,
    });
  });

  it('stores the report, share link and file references in the final update', async () => {
    const { client, mutation } = buildClient();

    await persistSeoAuditResult({
      client,
      auditId: 'audit-1',
      result: buildResult(),
      finishedAt: new Date('2026-10-06T10:00:00Z'),
      exports: {
        reportHtml: '<html>report</html>',
        reportUrl: 'https://crm.example.com/s/seo-audit/report?id=audit-1&token=tok',
        shareToken: 'tok',
        excelFile: [{ fileId: 'excel-id', label: 'audit.xlsx' }],
        pdfFile: null,
        notes: ['PDF export failed: connect ECONNREFUSED'],
      },
    });

    const data = lastUpdateData(mutation);

    expect(data).toMatchObject({
      status: 'DONE',
      reportHtml: '<html>report</html>',
      reportUrl: 'https://crm.example.com/s/seo-audit/report?id=audit-1&token=tok',
      shareToken: 'tok',
      excelFile: [{ fileId: 'excel-id', label: 'audit.xlsx' }],
      exportNotes: 'PDF export failed: connect ECONNREFUSED',
    });
    expect(data.pdfFile).toBeUndefined();
  });

  it('writes no export fields when no exports are given', async () => {
    const { client, mutation } = buildClient();

    await persistSeoAuditResult({ client, auditId: 'audit-1', result: buildResult(), finishedAt: new Date() });

    expect(lastUpdateData(mutation)).not.toHaveProperty('reportHtml');
  });
});
