import { type RankedKeyword } from 'src/types/ranked-keyword';

export type RankingsSummary = {
  totalKeywords: number;
  estimatedMonthlyTraffic: number;
  positionCounts: {
    position1: number;
    positions2To3: number;
    positions4To10: number;
    positions11To20: number;
  } | null;
  keywords: RankedKeyword[];
};
