import { fetchBacklinkSummary } from 'src/dataforseo-client/fetch-backlink-summary';
import { fetchBacklinkTargets } from 'src/dataforseo-client/fetch-backlink-targets';
import { fetchCompetitors } from 'src/dataforseo-client/fetch-competitors';
import { fetchRankedKeywords } from 'src/dataforseo-client/fetch-ranked-keywords';
import { type DataForSeoCredentials } from 'src/types/data-for-seo-credentials';
import { type Market } from 'src/types/market';
import { type MarketData } from 'src/types/market-data';
import { toDataForSeoTarget } from 'src/utils/to-dataforseo-target.util';

type CollectMarketDataParams = {
  credentials: DataForSeoCredentials;
  origin: string;
  market: Market;
  fetchImplementation?: typeof fetch;
};

// Each request fails on its own: a missing backlinks subscription must not
// cost the audit its rankings.
export const collectMarketData = async ({
  credentials,
  origin,
  market,
  fetchImplementation,
}: CollectMarketDataParams): Promise<MarketData> => {
  const target = toDataForSeoTarget(origin);
  const notes: string[] = [];
  let costUsd = 0;

  const attempt = async <TResult extends { cost: number }>(
    label: string,
    request: () => Promise<TResult>,
  ): Promise<TResult | null> => {
    try {
      const result = await request();

      costUsd += result.cost;

      return result;
    } catch (error) {
      notes.push(
        `${label}: ${error instanceof Error ? error.message : 'request failed'}`,
      );

      return null;
    }
  };

  const [rankings, backlinkSummary, backlinkTargets, competitors] =
    await Promise.all([
      attempt('Rankings', () =>
        fetchRankedKeywords({ credentials, target, market, fetchImplementation }),
      ),
      attempt('Backlinks', () =>
        fetchBacklinkSummary({ credentials, target, fetchImplementation }),
      ),
      attempt('Backlink targets', () =>
        fetchBacklinkTargets({ credentials, target, fetchImplementation }),
      ),
      attempt('Competitors', () =>
        fetchCompetitors({ credentials, target, market, fetchImplementation }),
      ),
    ]);

  return {
    rankings: rankings?.rankings ?? null,
    backlinks: backlinkSummary?.summary ?? null,
    backlinkTargets: backlinkTargets?.targets ?? [],
    competitors: competitors?.competitors ?? [],
    costUsd,
    notes,
  };
};
