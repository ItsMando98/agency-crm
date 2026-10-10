import { describe, expect, it } from 'vitest';

import { buildSeoAuditResult } from 'src/__mocks__/build-seo-audit-result.mock';
import { buildReportAreasSection } from 'src/utils/build-report-areas-html.util';

describe('buildReportAreasSection', () => {
  it('lists areas from weakest to strongest with value, weight and a text rating', () => {
    const { body } = buildReportAreasSection(buildSeoAuditResult());

    expect(body.indexOf('Inhaltsqualität')).toBeLessThan(body.indexOf('Sicherheit'));
    expect(body).toContain('style="--v:98"');
    expect(body).toContain('<em>59</em>');
    expect(body).toContain('Stark');
    expect(body).toContain('Schwach');
    expect(body).toContain('cat c-crit');
    expect(body).toContain('cat c-good');
  });

  it('counts the open actions of each area', () => {
    const { body } = buildReportAreasSection(buildSeoAuditResult({ language: 'EN' }));

    expect(body).toMatch(/\d+ starting points?/);
    expect(body).not.toContain('No action needed');
  });

  it('keeps the bar inside its track for out-of-range scores', () => {
    const { body } = buildReportAreasSection(
      buildSeoAuditResult({ areaScores: { SECURITY: 140, LINKS: -5 } }),
    );

    expect(body).toContain('--v:100');
    expect(body).toContain('--v:0');
  });
});
