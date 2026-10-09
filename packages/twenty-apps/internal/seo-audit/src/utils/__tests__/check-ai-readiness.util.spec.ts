import { describe, expect, it } from 'vitest';

import { buildAiReadiness } from 'src/__mocks__/build-ai-readiness.mock';
import { checkAiReadiness } from 'src/utils/check-ai-readiness.util';

describe('checkAiReadiness', () => {
  it('returns nothing when the site is ready', () => {
    expect(checkAiReadiness({ aiReadiness: buildAiReadiness(), language: 'DE' })).toEqual([]);
  });

  it('names the blocked crawlers', () => {
    const findings = checkAiReadiness({
      aiReadiness: buildAiReadiness({
        crawlerAccess: {
          GPTBOT: 'BLOCKED',
          OAI_SEARCHBOT: 'ALLOWED',
          CLAUDEBOT: 'BLOCKED',
          PERPLEXITYBOT: 'ALLOWED',
          GOOGLE_EXTENDED: 'ALLOWED',
        },
      }),
      language: 'DE',
    });

    expect(findings).toEqual([
      {
        ruleId: 'AI_CRAWLERS_BLOCKED',
        affectedUrls: [],
        count: 2,
        details: ['Gesperrt: GPTBot, ClaudeBot'],
      },
    ]);
  });

  it('writes the detail line in English', () => {
    const findings = checkAiReadiness({
      aiReadiness: buildAiReadiness({
        crawlerAccess: {
          GPTBOT: 'ALLOWED',
          OAI_SEARCHBOT: 'ALLOWED',
          CLAUDEBOT: 'ALLOWED',
          PERPLEXITYBOT: 'BLOCKED',
          GOOGLE_EXTENDED: 'ALLOWED',
        },
      }),
      language: 'EN',
    });

    expect(findings[0].details).toEqual(['Blocked: PerplexityBot']);
  });

  it('suggests llms.txt and FAQ markup when they are missing', () => {
    expect(
      checkAiReadiness({
        aiReadiness: buildAiReadiness({ llmsTxtFound: false, faqSchemaFound: false }),
        language: 'DE',
      }).map((finding) => finding.ruleId),
    ).toEqual(['LLMS_TXT_MISSING', 'FAQ_SCHEMA_MISSING']);
  });

  it('leaves missing organization markup to the structured data check', () => {
    expect(
      checkAiReadiness({
        aiReadiness: buildAiReadiness({ organizationSchemaFound: false }),
        language: 'DE',
      }),
    ).toEqual([]);
  });
});
