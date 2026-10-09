import { DATAFORSEO_LIGHTHOUSE_TIMEOUT_MS } from 'src/constants/dataforseo.const';
import { requestDataForSeo } from 'src/dataforseo-client/request-dataforseo';
import { type DataForSeoCredentials } from 'src/types/data-for-seo-credentials';
import { type LighthouseSummary } from 'src/types/lighthouse-summary';
import { parseLighthouse } from 'src/utils/parse-lighthouse.util';

type FetchLighthouseParams = {
  credentials: DataForSeoCredentials;
  url: string;
  fetchImplementation?: typeof fetch;
};

export const fetchLighthouse = async ({
  credentials,
  url,
  fetchImplementation,
}: FetchLighthouseParams): Promise<{
  lighthouse: LighthouseSummary | null;
  cost: number;
}> => {
  const { result, cost } = await requestDataForSeo({
    credentials,
    path: '/v3/on_page/lighthouse/live/json',
    body: [{ url, for_mobile: true, categories: ['performance'] }],
    timeoutMs: DATAFORSEO_LIGHTHOUSE_TIMEOUT_MS,
    fetchImplementation,
  });

  return { lighthouse: parseLighthouse(result, url), cost };
};
