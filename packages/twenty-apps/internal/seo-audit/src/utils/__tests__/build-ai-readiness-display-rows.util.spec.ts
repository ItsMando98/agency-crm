import { describe, expect, it } from 'vitest';

import { buildAiReadiness } from 'src/__mocks__/build-ai-readiness.mock';
import { buildAiReadinessDisplayRows } from 'src/utils/build-ai-readiness-display-rows.util';

describe('buildAiReadinessDisplayRows', () => {
  it('lists every AI crawler and the three file and markup checks', () => {
    const rows = buildAiReadinessDisplayRows(buildAiReadiness(), 'EN');

    expect(rows.map((row) => row.label)).toEqual([
      'Crawler access: GPTBot',
      'Crawler access: OAI-SearchBot',
      'Crawler access: ClaudeBot',
      'Crawler access: PerplexityBot',
      'Crawler access: Google-Extended',
      'llms.txt',
      'Organization markup on the homepage',
      'FAQ markup',
    ]);
    expect(rows.every((row) => row.isInPlace)).toBe(true);
  });

  it('marks blocked crawlers and missing files in German', () => {
    const rows = buildAiReadinessDisplayRows(
      buildAiReadiness({
        crawlerAccess: {
          GPTBOT: 'BLOCKED',
          OAI_SEARCHBOT: 'ALLOWED',
          CLAUDEBOT: 'ALLOWED',
          PERPLEXITYBOT: 'ALLOWED',
          GOOGLE_EXTENDED: 'ALLOWED',
        },
        llmsTxtFound: false,
      }),
      'DE',
    );

    expect(rows[0]).toEqual({ label: 'Crawler-Zugriff: GPTBot', value: 'gesperrt', isInPlace: false });
    expect(rows[1]).toEqual({ label: 'Crawler-Zugriff: OAI-SearchBot', value: 'erlaubt', isInPlace: true });
    expect(rows[5]).toEqual({ label: 'llms.txt', value: 'fehlt', isInPlace: false });
    expect(rows[6]).toEqual({ label: 'Organisations-Markup auf der Startseite', value: 'vorhanden', isInPlace: true });
  });
});
