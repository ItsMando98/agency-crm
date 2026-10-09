import { describe, expect, it } from 'vitest';

import { buildAiVisibility } from 'src/__mocks__/build-ai-visibility.mock';
import { buildSeoAuditResult } from 'src/__mocks__/build-seo-audit-result.mock';
import { buildReportAiVisibilityHtml } from 'src/utils/build-report-ai-visibility-html.util';

describe('buildReportAiVisibilityHtml', () => {
  it('renders the share, the date and the answers', () => {
    const html = buildReportAiVisibilityHtml(
      buildSeoAuditResult({ language: 'EN', aiVisibility: buildAiVisibility() }),
    );

    expect(html).toContain('<h2>AI answers</h2>');
    expect(html).toContain('>30 %<');
    expect(html).toContain('Measured on 2026-10-09');
    expect(html).toContain('<th>ChatGPT</th>');
    expect(html).toContain('>cited<');
    expect(html).toContain('>rival.de, other.de<');
  });

  it('renders nothing when the check was off', () => {
    expect(buildReportAiVisibilityHtml(buildSeoAuditResult({ aiVisibility: null }))).toBe('');
  });

  it('renders only the notes when nothing could be asked', () => {
    const html = buildReportAiVisibilityHtml(
      buildSeoAuditResult({
        language: 'EN',
        aiVisibility: buildAiVisibility({ rows: [], presenceRate: null, queriesTested: 0, notes: ['Skipped for a reason.'] }),
      }),
    );

    expect(html).toContain('Skipped for a reason.');
    expect(html).not.toContain('<table>');
  });

  it('escapes questions and domains', () => {
    const html = buildReportAiVisibilityHtml(
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

    expect(html).not.toContain('<script>alert');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('&lt;b&gt;x&lt;/b&gt;.de');
  });
});
