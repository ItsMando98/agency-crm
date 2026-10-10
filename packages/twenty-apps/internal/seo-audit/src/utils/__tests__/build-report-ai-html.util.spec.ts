import { describe, expect, it } from 'vitest';

import { buildAiReadiness } from 'src/__mocks__/build-ai-readiness.mock';
import { buildAiVisibility } from 'src/__mocks__/build-ai-visibility.mock';
import { buildSeoAuditResult } from 'src/__mocks__/build-seo-audit-result.mock';
import { buildReportAiSection } from 'src/utils/build-report-ai-html.util';

describe('buildReportAiSection', () => {
  it('renders the readiness checks with their status', () => {
    const { body } = buildReportAiSection(
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

    expect(body).toContain('GPTBot: blocked');
    expect(body).toContain('ClaudeBot: allowed');
    expect(body).toContain('llms.txt: missing');
    expect(body).toContain('chip st-n');
    expect(body).toContain('chip st-y');
  });

  it('renders the share, the date and the answers when the check ran', () => {
    const { body } = buildReportAiSection(
      buildSeoAuditResult({ language: 'EN', aiVisibility: buildAiVisibility() }),
    );

    expect(body).toContain('30 %');
    expect(body).toContain('Tested on 2026-10-09');
    expect(body).toContain('<th>ChatGPT</th>');
    expect(body).toContain('cited');
    expect(body).toContain('rival.de, other.de');
  });

  it('shows only the readiness checks when the check was off', () => {
    const { body } = buildReportAiSection(buildSeoAuditResult({ aiVisibility: null }));

    expect(body).not.toContain('<table');
  });

  it('shows notes when nothing could be asked', () => {
    const { body } = buildReportAiSection(
      buildSeoAuditResult({
        language: 'EN',
        aiVisibility: buildAiVisibility({ rows: [], presenceRate: null, queriesTested: 0, notes: ['Skipped for a reason.'] }),
      }),
    );

    expect(body).toContain('Skipped for a reason.');
    expect(body).not.toContain('<table');
  });

  it('escapes questions and domains', () => {
    const { body } = buildReportAiSection(
      buildSeoAuditResult({
        aiVisibility: buildAiVisibility({
          rows: [
            {
              query: '<script>alert(1)</script>',
              results: { CHATGPT: 'ABSENT', PERPLEXITY: 'ABSENT', GEMINI: 'ABSENT' },
              instead: ['<b>x</b>.de'],
            },
          ],
        }),
      }),
    );

    expect(body).not.toContain('<script>alert');
    expect(body).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(body).toContain('&lt;b&gt;x&lt;/b&gt;.de');
  });
});
