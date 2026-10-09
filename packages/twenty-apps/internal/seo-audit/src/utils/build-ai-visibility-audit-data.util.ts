import { type AiVisibility } from 'src/types/ai-visibility';
import { type MarketData } from 'src/types/market-data';

type BuildAiVisibilityAuditDataParams = {
  aiVisibility: AiVisibility | null;
  marketData: MarketData | null;
};

// The cost goes into the same field as the market data cost, so one place
// shows everything the audit spent at DataForSEO.
export const buildAiVisibilityAuditData = ({
  aiVisibility,
  marketData,
}: BuildAiVisibilityAuditDataParams) => {
  if (aiVisibility === null) {
    return {};
  }

  return {
    aiPresenceRate: aiVisibility.presenceRate,
    aiQueriesTested: aiVisibility.queriesTested,
    aiVisibility,
    marketDataCostUsd: (marketData?.costUsd ?? 0) + aiVisibility.costUsd,
  };
};
