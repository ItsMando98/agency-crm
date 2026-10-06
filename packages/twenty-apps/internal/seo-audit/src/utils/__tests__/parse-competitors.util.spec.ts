import { describe, expect, it } from 'vitest';

import { parseCompetitors } from 'src/utils/parse-competitors.util';

const item = (domain: string, intersections: number, etv = 0) => ({
  domain,
  intersections,
  metrics: { organic: { etv } },
});

describe('parseCompetitors', () => {
  it('sorts by shared keywords and drops the own domain and generic sites', () => {
    expect(
      parseCompetitors(
        {
          items: [
            item('wikipedia.org', 900),
            item('example.com', 800),
            item('rival-a.de', 120, 3000),
            item('rival-b.de', 340, 500),
            item('de.wikipedia.org', 700),
          ],
        },
        'example.com',
      ),
    ).toEqual([
      { domain: 'rival-b.de', commonKeywords: 340, estimatedTraffic: 500 },
      { domain: 'rival-a.de', commonKeywords: 120, estimatedTraffic: 3000 },
    ]);
  });

  it('reads traffic from the full domain metrics when needed and caps the list', () => {
    const many = Array.from({ length: 9 }, (_, index) => ({
      domain: `rival-${index}.de`,
      intersections: index,
      full_domain_metrics: { organic: { etv: 10 } },
    }));
    const competitors = parseCompetitors({ items: many }, 'example.com');

    expect(competitors).toHaveLength(5);
    expect(competitors[0].estimatedTraffic).toBe(10);
  });

  it('returns an empty list for unexpected shapes', () => {
    expect(parseCompetitors(null, 'example.com')).toEqual([]);
    expect(parseCompetitors({ items: [null, { domain: 5 }] }, 'example.com')).toEqual([]);
  });
});
