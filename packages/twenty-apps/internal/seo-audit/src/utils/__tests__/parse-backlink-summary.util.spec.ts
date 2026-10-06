import { describe, expect, it } from 'vitest';

import { parseBacklinkSummary } from 'src/utils/parse-backlink-summary.util';

describe('parseBacklinkSummary', () => {
  it('maps the summary fields', () => {
    expect(
      parseBacklinkSummary({
        backlinks: 1200,
        referring_domains: 85,
        broken_backlinks: 31,
        broken_pages: 6,
        rank: 412,
      }),
    ).toEqual({ backlinks: 1200, referringDomains: 85, brokenBacklinks: 31, brokenPages: 6, rank: 412 });
  });

  it('keeps optional fields null when missing', () => {
    expect(parseBacklinkSummary({ backlinks: 5 })).toEqual({
      backlinks: 5,
      referringDomains: 0,
      brokenBacklinks: null,
      brokenPages: null,
      rank: null,
    });
  });

  it.each([null, {}, { backlinks: 'many' }])('returns null for %j', (result) => {
    expect(parseBacklinkSummary(result)).toBeNull();
  });
});
