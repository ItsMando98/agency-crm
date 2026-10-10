import { KEYWORD_RELEVANCE_THRESHOLD } from 'src/constants/seo-thresholds.const';
import { KEYWORD_CATEGORY } from 'src/constants/seo-audit.constants';
import { type MissingLocation } from 'src/types/audit-insights';
import { type CrawledPage } from 'src/types/crawled-page';
import { type ScoredKeyword } from 'src/types/scored-keyword';

const MIN_PLACE_SEARCH_VOLUME = 100;
const MAX_LOCATIONS = 5;
const MAX_KEYWORDS_PER_LOCATION = 3;

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/ß/g, 'ss')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

// A place counts as covered when one crawled page names it in its address or title.
export const findMissingLocations = (
  keywords: ScoredKeyword[],
  pages: CrawledPage[],
): MissingLocation[] => {
  const coveringText = pages.map((page) => ` ${normalize(`${page.url} ${page.title ?? ''}`)} `);
  const byPlace = new Map<string, { place: string; searchVolume: number; keywords: ScoredKeyword[] }>();

  for (const keyword of keywords) {
    if (
      keyword.place === null ||
      keyword.category === KEYWORD_CATEGORY.NOT_RELEVANT ||
      (keyword.relevance ?? 0) < KEYWORD_RELEVANCE_THRESHOLD
    ) {
      continue;
    }

    const key = normalize(keyword.place);

    if (key === '') {
      continue;
    }

    const entry = byPlace.get(key) ?? { place: keyword.place, searchVolume: 0, keywords: [] };

    entry.searchVolume += keyword.searchVolume;
    entry.keywords.push(keyword);
    byPlace.set(key, entry);
  }

  return [...byPlace.entries()]
    .filter(
      ([key, entry]) =>
        entry.searchVolume >= MIN_PLACE_SEARCH_VOLUME &&
        !coveringText.some((text) => text.includes(` ${key} `)),
    )
    .map(([, entry]) => ({
      place: entry.place,
      searchVolume: entry.searchVolume,
      keywords: entry.keywords
        .sort((first, second) => second.searchVolume - first.searchVolume)
        .slice(0, MAX_KEYWORDS_PER_LOCATION)
        .map((keyword) => keyword.keyword),
    }))
    .sort((first, second) => second.searchVolume - first.searchVolume)
    .slice(0, MAX_LOCATIONS);
};
