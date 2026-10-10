import { describe, expect, it } from 'vitest';

import { buildSeoAuditResult } from 'src/__mocks__/build-seo-audit-result.mock';
import { buildReportClosingHtml } from 'src/utils/build-report-closing-html.util';

const branding = { brandName: 'Muster Agentur', accentColor: '#7a3aa7', bookingUrl: null };

describe('buildReportClosingHtml', () => {
  it('renders the footer without a call to action when no booking link is set', () => {
    const html = buildReportClosingHtml(buildSeoAuditResult(), branding);

    expect(html).toContain('<footer>');
    expect(html).toContain('Muster Agentur');
    expect(html).not.toContain('class="cta"');
  });

  it('renders the call to action with the number of actions and the link', () => {
    const result = buildSeoAuditResult({ language: 'EN' });
    const html = buildReportClosingHtml(result, { ...branding, bookingUrl: 'https://cal.example.com/me' });

    expect(html).toContain('class="cta"');
    expect(html).toContain(`We go through the ${result.tasks.length} actions together`);
    expect(html).toContain('href="https://cal.example.com/me"');
  });

  it('falls back to the document title without a brand name', () => {
    const html = buildReportClosingHtml(buildSeoAuditResult({ language: 'EN' }), {
      ...branding,
      brandName: null,
    });

    expect(html).toContain('SEO audit');
  });
});
