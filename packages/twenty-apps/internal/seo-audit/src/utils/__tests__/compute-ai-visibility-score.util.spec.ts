import { describe, expect, it } from 'vitest';

import { buildAiReadiness } from 'src/__mocks__/build-ai-readiness.mock';
import { type AiVisibility } from 'src/types/ai-visibility';
import { computeAiVisibilityScore } from 'src/utils/compute-ai-visibility-score.util';

const buildVisibility = (presenceRate: number | null): AiVisibility => ({
  rows: [],
  engines: ['CHATGPT', 'PERPLEXITY', 'GEMINI'],
  presenceRate,
  queriesTested: presenceRate === null ? 0 : 8,
  testedAt: '2026-10-09T10:00:00.000Z',
  costUsd: 0,
  notes: [],
});

describe('computeAiVisibilityScore', () => {
  it('uses the readiness alone without a measurement', () => {
    expect(computeAiVisibilityScore({ aiReadiness: buildAiReadiness(), aiVisibility: null })).toBe(100);
    expect(computeAiVisibilityScore({ aiReadiness: buildAiReadiness(), aiVisibility: buildVisibility(null) })).toBe(100);
  });

  it('weights the presence with 70 and the readiness with 30', () => {
    expect(computeAiVisibilityScore({ aiReadiness: buildAiReadiness(), aiVisibility: buildVisibility(0.5) })).toBe(65);
    expect(computeAiVisibilityScore({ aiReadiness: buildAiReadiness(), aiVisibility: buildVisibility(0) })).toBe(30);
    expect(computeAiVisibilityScore({ aiReadiness: buildAiReadiness(), aiVisibility: buildVisibility(1) })).toBe(100);
  });

  it('lets a blocked site with good presence still lose points for the readiness', () => {
    expect(
      computeAiVisibilityScore({
        aiReadiness: buildAiReadiness({ organizationSchemaFound: false }),
        aiVisibility: buildVisibility(1),
      }),
    ).toBe(91);
  });
});
