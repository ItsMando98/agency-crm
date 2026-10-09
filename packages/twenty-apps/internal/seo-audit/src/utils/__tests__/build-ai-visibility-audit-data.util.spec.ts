import { describe, expect, it } from 'vitest';

import { buildAiVisibility } from 'src/__mocks__/build-ai-visibility.mock';
import { buildAiVisibilityAuditData } from 'src/utils/build-ai-visibility-audit-data.util';

describe('buildAiVisibilityAuditData', () => {
  it('writes nothing when the check was off', () => {
    expect(buildAiVisibilityAuditData({ aiVisibility: null, marketData: null })).toEqual({});
  });

  it('stores the rate, the question count and the answers', () => {
    const aiVisibility = buildAiVisibility();

    expect(buildAiVisibilityAuditData({ aiVisibility, marketData: null })).toMatchObject({
      aiPresenceRate: 0.3,
      aiQueriesTested: 2,
      aiVisibility,
    });
  });

  it('adds the cost to the market data cost', () => {
    const data = buildAiVisibilityAuditData({
      aiVisibility: buildAiVisibility({ costUsd: 0.6 }),
      marketData: {
        rankings: null,
        backlinks: null,
        backlinkTargets: [],
        lighthouse: null,
        competitors: [],
        costUsd: 0.31,
        notes: [],
      },
    });

    expect(data.marketDataCostUsd).toBeCloseTo(0.91);
  });
});
