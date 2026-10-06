import { type MarketData } from 'src/types/market-data';

export const buildMarketAuditData = (marketData: MarketData | null) =>
  marketData === null
    ? {}
    : {
        organicKeywordCount: marketData.rankings?.totalKeywords ?? null,
        estimatedMonthlyTraffic: marketData.rankings
          ? Math.round(marketData.rankings.estimatedMonthlyTraffic)
          : null,
        backlinkCount: marketData.backlinks?.backlinks ?? null,
        referringDomainCount: marketData.backlinks?.referringDomains ?? null,
        competitors: marketData.competitors,
        marketDataCostUsd: marketData.costUsd,
        marketDataNotes: marketData.notes.length > 0 ? marketData.notes.join('\n') : null,
      };
