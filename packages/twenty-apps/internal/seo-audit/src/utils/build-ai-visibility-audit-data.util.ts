import { type AiVisibility } from 'src/types/ai-visibility';
import { type MarketData } from 'src/types/market-data';

type BuildAiVisibilityAuditDataParams = {
  aiVisibility: AiVisibility | null;
  marketData: MarketData | null;
};

// The cost and the notes go into the same fields as the market data ones, so
// one place shows everything the audit spent at DataForSEO.
export const buildAiVisibilityAuditData = ({
  aiVisibility,
  marketData,
}: BuildAiVisibilityAuditDataParams) => {
  if (aiVisibility === null) {
    return {};
  }

  const notes = [...(marketData?.notes ?? []), ...aiVisibility.notes];

  return {
    aiPresenceRate: aiVisibility.presenceRate,
    aiQueriesTested: aiVisibility.queriesTested,
    aiVisibility,
    marketDataCostUsd: (marketData?.costUsd ?? 0) + aiVisibility.costUsd,
    marketDataNotes: notes.length > 0 ? notes.join('\n') : null,
  };
};
