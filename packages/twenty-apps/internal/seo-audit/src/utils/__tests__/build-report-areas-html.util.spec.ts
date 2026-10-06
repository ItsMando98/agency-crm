import { describe, expect, it } from 'vitest';

import { buildSeoAuditResult } from 'src/__mocks__/build-seo-audit-result.mock';
import { buildReportAreasHtml } from 'src/utils/build-report-areas-html.util';

describe('buildReportAreasHtml', () => {
  it('lists areas from strongest to weakest with width, value and a text rating', () => {
    const html = buildReportAreasHtml(buildSeoAuditResult());

    expect(html.indexOf('Sicherheit')).toBeLessThan(html.indexOf('Inhaltsqualität'));
    expect(html).toContain('style="width: 98%"');
    expect(html).toContain('<strong>59</strong>');
    expect(html).toContain('Stark');
    expect(html).toContain('Schwach');
    expect(html).toContain('dot-WEAK');
  });

  it('keeps the bar inside its track for out-of-range scores', () => {
    const html = buildReportAreasHtml(buildSeoAuditResult({ areaScores: { SECURITY: 140, LINKS: -5 } }));

    expect(html).toContain('width: 100%');
    expect(html).toContain('width: 0%');
  });
});
