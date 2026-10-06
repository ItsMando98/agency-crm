import { type ScoredKeyword } from 'src/types/scored-keyword';

export const buildKeywordRecordData = (
  seoAuditId: string,
  keyword: ScoredKeyword,
) => ({
  seoAuditId,
  keyword: keyword.keyword,
  rankPosition: keyword.position,
  searchVolume: keyword.searchVolume,
  estimatedTraffic: keyword.estimatedTraffic,
  url: keyword.url,
  category: keyword.category,
  relevance: keyword.relevance,
  confidence: keyword.confidence,
  needsReview: keyword.needsReview,
});
