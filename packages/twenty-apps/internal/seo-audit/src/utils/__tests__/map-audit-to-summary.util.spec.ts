import { describe, expect, it } from 'vitest';

import { mapAuditToSummary } from 'src/utils/map-audit-to-summary.util';

describe('mapAuditToSummary', () => {
  it('maps a finished audit', () => {
    expect(
      mapAuditToSummary({
        id: 'a1',
        name: 'example.com 2026-10-01',
        domain: 'https://example.com',
        status: 'DONE',
        score: 81,
        grade: 'B',
        areaScores: { ON_PAGE: 70, LINKS: 90 },
        pagesCrawled: 42,
        reportUrl: 'https://crm.test/s/report',
        companyId: 'c1',
        createdAt: '2026-10-01T10:00:00.000Z',
        finishedAt: '2026-10-01T10:05:00.000Z',
      }),
    ).toEqual({
      id: 'a1',
      name: 'example.com 2026-10-01',
      domain: 'https://example.com',
      status: 'DONE',
      score: 81,
      grade: 'B',
      areaScores: { ON_PAGE: 70, LINKS: 90 },
      pagesCrawled: 42,
      reportUrl: 'https://crm.test/s/report',
      companyId: 'c1',
      createdAt: '2026-10-01T10:00:00.000Z',
      finishedAt: '2026-10-01T10:05:00.000Z',
    });
  });

  it('turns missing and empty values into null', () => {
    const summary = mapAuditToSummary({ id: 'a1', score: null, grade: '', areaScores: null });

    expect(summary).toMatchObject({
      id: 'a1',
      name: null,
      status: null,
      score: null,
      grade: null,
      areaScores: null,
      pagesCrawled: null,
    });
  });

  it('keeps only numeric area scores', () => {
    expect(mapAuditToSummary({ id: 'a1', areaScores: { ON_PAGE: 70, LINKS: 'n/a' } }).areaScores).toEqual({
      ON_PAGE: 70,
    });
  });
});
