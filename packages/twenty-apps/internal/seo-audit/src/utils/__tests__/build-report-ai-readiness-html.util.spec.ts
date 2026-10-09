import { describe, expect, it } from 'vitest';

import { buildAiReadiness } from 'src/__mocks__/build-ai-readiness.mock';
import { buildSeoAuditResult } from 'src/__mocks__/build-seo-audit-result.mock';
import { buildReportAiReadinessHtml } from 'src/utils/build-report-ai-readiness-html.util';

describe('buildReportAiReadinessHtml', () => {
  it('renders the checklist with the status of every check', () => {
    const html = buildReportAiReadinessHtml(
      buildSeoAuditResult({
        language: 'EN',
        aiReadiness: buildAiReadiness({
          crawlerAccess: {
            GPTBOT: 'BLOCKED',
            OAI_SEARCHBOT: 'ALLOWED',
            CLAUDEBOT: 'ALLOWED',
            PERPLEXITYBOT: 'ALLOWED',
            GOOGLE_EXTENDED: 'ALLOWED',
          },
          llmsTxtFound: false,
        }),
      }),
    );

    expect(html).toContain('<h2>AI readiness</h2>');
    expect(html).toContain('Crawler access: GPTBot');
    expect(html).toContain('>blocked<');
    expect(html).toContain('>allowed<');
    expect(html).toContain('llms.txt');
    expect(html).toContain('>missing<');
    expect(html).toContain('>present<');
  });

  it('keeps the table together on one print page', () => {
    expect(buildReportAiReadinessHtml(buildSeoAuditResult({ language: 'DE' }))).toContain(
      'class="keep-together"',
    );
  });
});
