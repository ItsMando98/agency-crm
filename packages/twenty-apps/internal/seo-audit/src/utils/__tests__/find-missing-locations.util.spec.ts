import { describe, expect, it } from 'vitest';

import { buildCrawledPage } from 'src/__mocks__/build-crawled-page.mock';
import { buildScoredKeyword } from 'src/__mocks__/build-scored-keyword.mock';
import { findMissingLocations } from 'src/utils/find-missing-locations.util';

const pages = [
  buildCrawledPage({ url: 'https://beispiel.de/', title: 'Entrümpelung in Düsseldorf' }),
  buildCrawledPage({ url: 'https://beispiel.de/entruempelung-koeln', title: 'Köln' }),
];

describe('findMissingLocations', () => {
  it('names a place with search volume that no page covers', () => {
    const result = findMissingLocations(
      [
        buildScoredKeyword({ keyword: 'entrümpelung neuss', place: 'Neuss', searchVolume: 1500 }),
        buildScoredKeyword({ keyword: 'wohnungsauflösung neuss', place: 'Neuss', searchVolume: 400 }),
      ],
      pages,
    );

    expect(result).toEqual([
      { place: 'Neuss', searchVolume: 1900, keywords: ['entrümpelung neuss', 'wohnungsauflösung neuss'] },
    ]);
  });

  it('treats a place as covered when the title or the address names it, ignoring umlauts', () => {
    const result = findMissingLocations(
      [
        buildScoredKeyword({ place: 'Düsseldorf', searchVolume: 5000 }),
        buildScoredKeyword({ place: 'Duesseldorf', searchVolume: 5000 }),
        buildScoredKeyword({ place: 'Köln', searchVolume: 5000 }),
        buildScoredKeyword({ place: 'Koeln', searchVolume: 5000 }),
        buildScoredKeyword({ place: 'Neuss', searchVolume: 5000 }),
      ],
      pages,
    );

    expect(result.map((entry) => entry.place)).toEqual(['Neuss']);
  });

  it('ignores keywords that are not relevant, have no place or too little volume', () => {
    const result = findMissingLocations(
      [
        buildScoredKeyword({ place: 'Neuss', searchVolume: 5000, relevance: 0.1 }),
        buildScoredKeyword({ place: 'Neuss', searchVolume: 5000, category: 'NOT_RELEVANT' }),
        buildScoredKeyword({ place: null, searchVolume: 5000 }),
        buildScoredKeyword({ place: 'Bonn', searchVolume: 30 }),
      ],
      pages,
    );

    expect(result).toEqual([]);
  });

  it('keeps the five places with the most searches', () => {
    const keywords = ['A', 'B', 'C', 'D', 'E', 'F'].map((place, index) =>
      buildScoredKeyword({ keyword: `k ${place}`, place: `Ort${place}`, searchVolume: 1000 + index }),
    );

    const result = findMissingLocations(keywords, pages);

    expect(result).toHaveLength(5);
    expect(result[0]?.place).toBe('OrtF');
  });
});
