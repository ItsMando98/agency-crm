import { describe, expect, it } from 'vitest';

import { buildAiReadiness } from 'src/__mocks__/build-ai-readiness.mock';
import { computeAiReadinessScore } from 'src/utils/compute-ai-readiness-score.util';

describe('computeAiReadinessScore', () => {
  it('scores 100 when everything is in place', () => {
    expect(computeAiReadinessScore(buildAiReadiness())).toBe(100);
  });

  it('scores 0 when nothing is in place', () => {
    expect(
      computeAiReadinessScore(
        buildAiReadiness({
          crawlerAccess: {
            GPTBOT: 'BLOCKED',
            OAI_SEARCHBOT: 'BLOCKED',
            CLAUDEBOT: 'BLOCKED',
            PERPLEXITYBOT: 'BLOCKED',
            GOOGLE_EXTENDED: 'BLOCKED',
          },
          llmsTxtFound: false,
          organizationSchemaFound: false,
          faqSchemaFound: false,
        }),
      ),
    ).toBe(0);
  });

  it('weights crawler access by the share of crawlers that may read the site', () => {
    expect(
      computeAiReadinessScore(
        buildAiReadiness({
          crawlerAccess: {
            GPTBOT: 'BLOCKED',
            OAI_SEARCHBOT: 'BLOCKED',
            CLAUDEBOT: 'ALLOWED',
            PERPLEXITYBOT: 'ALLOWED',
            GOOGLE_EXTENDED: 'ALLOWED',
          },
          llmsTxtFound: false,
          faqSchemaFound: false,
        }),
      ),
    ).toBe(60);
  });

  it('counts the organization markup as the second biggest part', () => {
    expect(
      computeAiReadinessScore(buildAiReadiness({ organizationSchemaFound: false })),
    ).toBe(70);
  });
});
