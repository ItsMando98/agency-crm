export type KeywordAssessment = {
  keyword: string;
  relevance: number;
  confidence: number;
  needsReview: boolean;
  // The city or region the keyword names, null for keywords without a place.
  place: string | null;
};
