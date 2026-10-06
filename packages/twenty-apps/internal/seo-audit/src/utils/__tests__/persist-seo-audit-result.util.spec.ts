import { describe, expect, it, vi } from 'vitest';

import { buildCrawledPage } from 'src/__mocks__/build-crawled-page.mock';
import { persistSeoAuditResult } from 'src/utils/persist-seo-audit-result.util';
import { type SeoAuditResult } from 'src/types/seo-audit-result';

const buildResult = (overrides: Partial<SeoAuditResult> = {}): SeoAuditResult => ({
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
  reportMarkdown: '# Report',
  ...overrides,
});

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
});
