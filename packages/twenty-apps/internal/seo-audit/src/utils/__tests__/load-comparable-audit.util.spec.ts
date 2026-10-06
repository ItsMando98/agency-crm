import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { loadComparableAudit } from 'src/utils/load-comparable-audit.util';

const buildClient = (responses: unknown[]) => {
  const query = vi.fn();

  for (const response of responses) {
    query.mockResolvedValueOnce(response);
  }

  return { client: { query } as unknown as CoreApiClient, query };
};

describe('loadComparableAudit', () => {
  it('returns null when no audit matches', async () => {
    const { client, query } = buildClient([{ seoAudits: { edges: [] } }]);

    expect(await loadComparableAudit(client, { id: { eq: 'nope' } })).toBeNull();
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('loads the audit with its tasks', async () => {
    const { client, query } = buildClient([
      {
        seoAudits: {
          edges: [
            {
              node: {
                id: 'a1',
                domain: 'https://example.com',
                status: 'DONE',
                score: 70,
                grade: 'B',
                areaScores: { ON_PAGE: 60 },
                organicKeywordCount: 12,
                estimatedMonthlyTraffic: 340,
                backlinkCount: null,
              },
            },
          ],
        },
      },
      { seoAuditTasks: { edges: [{ node: { ruleId: 'TITLE_MISSING', name: 'Add titles', priority: 'HIGH' } }, { node: { ruleId: null, name: 'Manual', priority: 'LOW' } }] } },
    ]);

    const loaded = await loadComparableAudit(client, { id: { eq: 'a1' } }, [{ createdAt: 'DescNullsLast' }]);

    expect(loaded?.summary).toMatchObject({ id: 'a1', score: 70 });
    expect(loaded?.comparable).toMatchObject({
      score: 70,
      organicKeywordCount: 12,
      estimatedMonthlyTraffic: 340,
      backlinkCount: null,
      tasks: [
        { ruleId: 'TITLE_MISSING', name: 'Add titles', priority: 'HIGH' },
        { ruleId: null, name: 'Manual', priority: 'LOW' },
      ],
    });
    expect(query.mock.calls[0][0].seoAudits.__args.orderBy).toEqual([{ createdAt: 'DescNullsLast' }]);
    expect(query.mock.calls[1][0].seoAuditTasks.__args.filter).toEqual({ seoAuditId: { eq: 'a1' } });
  });
});
