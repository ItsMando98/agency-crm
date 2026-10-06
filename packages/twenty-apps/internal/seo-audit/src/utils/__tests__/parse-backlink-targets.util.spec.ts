import { describe, expect, it } from 'vitest';

import { parseBacklinkTargets } from 'src/utils/parse-backlink-targets.util';

describe('parseBacklinkTargets', () => {
  it('maps pages with their backlink counts', () => {
    expect(
      parseBacklinkTargets({
        items: [
          { url: 'https://example.com/old', backlinks: 31, referring_domains: 12 },
          { page: 'https://example.com/other', backlinks: 4 },
        ],
      }),
    ).toEqual([
      { url: 'https://example.com/old', backlinks: 31, referringDomains: 12 },
      { url: 'https://example.com/other', backlinks: 4, referringDomains: 0 },
    ]);
  });

  it('skips entries without a URL and tolerates other shapes', () => {
    expect(parseBacklinkTargets({ items: [{ backlinks: 4 }, null] })).toEqual([]);
    expect(parseBacklinkTargets(null)).toEqual([]);
    expect(parseBacklinkTargets({ items: 'x' })).toEqual([]);
  });
});
