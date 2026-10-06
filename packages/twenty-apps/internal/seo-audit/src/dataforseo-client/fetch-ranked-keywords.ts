import { MARKETS, RANKED_KEYWORDS_LIMIT } from 'src/constants/dataforseo.const';
import { requestDataForSeo } from 'src/dataforseo-client/request-dataforseo';
import { type DataForSeoCredentials } from 'src/types/data-for-seo-credentials';
import { type Market } from 'src/types/market';
import { type RankingsSummary } from 'src/types/rankings-summary';
import { parseRankedKeywords } from 'src/utils/parse-ranked-keywords.util';

type FetchRankedKeywordsParams = {
  credentials: DataForSeoCredentials;
  target: string;
  market: Market;
  fetchImplementation?: typeof fetch;
};

export const fetchRankedKeywords = async ({
  credentials,
  target,
  market,
  fetchImplementation,
}: FetchRankedKeywordsParams): Promise<{
  rankings: RankingsSummary | null;
  cost: number;
}> => {
  const { result, cost } = await requestDataForSeo({
    credentials,
    path: '/v3/dataforseo_labs/google/ranked_keywords/live',
    body: [
      {
        target,
        location_code: MARKETS[market].locationCode,
        language_code: MARKETS[market].languageCode,
        limit: RANKED_KEYWORDS_LIMIT,
        order_by: ['keyword_data.keyword_info.search_volume,desc'],
      },
    ],
    fetchImplementation,
  });

  return { rankings: parseRankedKeywords(result), cost };
};
