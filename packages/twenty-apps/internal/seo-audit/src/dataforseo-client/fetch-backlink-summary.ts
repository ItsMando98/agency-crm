import { requestDataForSeo } from 'src/dataforseo-client/request-dataforseo';
import { type BacklinkSummary } from 'src/types/backlink-summary';
import { type DataForSeoCredentials } from 'src/types/data-for-seo-credentials';
import { parseBacklinkSummary } from 'src/utils/parse-backlink-summary.util';

type FetchBacklinkSummaryParams = {
  credentials: DataForSeoCredentials;
  target: string;
  fetchImplementation?: typeof fetch;
};

export const fetchBacklinkSummary = async ({
  credentials,
  target,
  fetchImplementation,
}: FetchBacklinkSummaryParams): Promise<{
  summary: BacklinkSummary | null;
  cost: number;
}> => {
  const { result, cost } = await requestDataForSeo({
    credentials,
    path: '/v3/backlinks/summary/live',
    body: [{ target, include_subdomains: true }],
    fetchImplementation,
  });

  return { summary: parseBacklinkSummary(result), cost };
};
