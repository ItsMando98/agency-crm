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

  it('adds the cost and the notes to the market data ones', () => {
    const data = buildAiVisibilityAuditData({
      aiVisibility: buildAiVisibility({ costUsd: 0.6, notes: ['Gemini: Gemini is down.'] }),
      marketData: {
        rankings: null,
        backlinks: null,
        backlinkTargets: [],
        lighthouse: null,
        competitors: [],
        costUsd: 0.31,
        notes: ['Backlinks: Access denied.'],
      },
    });

    expect(data.marketDataCostUsd).toBeCloseTo(0.91);
    expect(data.marketDataNotes).toBe('Backlinks: Access denied.\nGemini: Gemini is down.');
  });

  it('keeps the notes empty when there are none', () => {
    expect(
      buildAiVisibilityAuditData({ aiVisibility: buildAiVisibility({ notes: [] }), marketData: null }).marketDataNotes,
    ).toBeNull();
  });
});
