import { COMPETITORS_LIMIT, MARKETS } from 'src/constants/dataforseo.const';
import { requestDataForSeo } from 'src/dataforseo-client/request-dataforseo';
import { type Competitor } from 'src/types/competitor';
import { type DataForSeoCredentials } from 'src/types/data-for-seo-credentials';
import { type Market } from 'src/types/market';
import { parseCompetitors } from 'src/utils/parse-competitors.util';

type FetchCompetitorsParams = {
  credentials: DataForSeoCredentials;
  target: string;
  market: Market;
  fetchImplementation?: typeof fetch;
};

export const fetchCompetitors = async ({
  credentials,
  target,
  market,
  fetchImplementation,
}: FetchCompetitorsParams): Promise<{
  competitors: Competitor[];
  cost: number;
}> => {
  const { result, cost } = await requestDataForSeo({
    credentials,
    path: '/v3/dataforseo_labs/google/competitors_domain/live',
    body: [
      {
        target,
        location_code: MARKETS[market].locationCode,
        language_code: MARKETS[market].languageCode,
        limit: COMPETITORS_LIMIT,
      },
    ],
    fetchImplementation,
  });

  return { competitors: parseCompetitors(result, target), cost };
};
