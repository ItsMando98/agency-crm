import { type ScoredKeyword } from 'src/types/scored-keyword';

export const buildScoredKeyword = (overrides: Partial<ScoredKeyword> = {}): ScoredKeyword => ({
  keyword: 'kündigungsfrist',
  position: 17,
  searchVolume: 60000,
  estimatedTraffic: 10,
  url: 'https://example.com/kuendigung',
  category: 'NEAR_PAGE_ONE',
  relevance: 0.9,
  confidence: 0.9,
  needsReview: false,
  place: null,
  ...overrides,
});
