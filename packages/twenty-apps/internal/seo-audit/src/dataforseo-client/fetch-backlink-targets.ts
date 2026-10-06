import { BACKLINK_TARGETS_LIMIT } from 'src/constants/dataforseo.const';
import { requestDataForSeo } from 'src/dataforseo-client/request-dataforseo';
import { type BacklinkTarget } from 'src/types/backlink-target';
import { type DataForSeoCredentials } from 'src/types/data-for-seo-credentials';
import { parseBacklinkTargets } from 'src/utils/parse-backlink-targets.util';

type FetchBacklinkTargetsParams = {
  credentials: DataForSeoCredentials;
  target: string;
  fetchImplementation?: typeof fetch;
};

export const fetchBacklinkTargets = async ({
  credentials,
  target,
  fetchImplementation,
}: FetchBacklinkTargetsParams): Promise<{
  targets: BacklinkTarget[];
  cost: number;
}> => {
  const { result, cost } = await requestDataForSeo({
    credentials,
    path: '/v3/backlinks/domain_pages_summary/live',
    body: [
      {
        target,
        limit: BACKLINK_TARGETS_LIMIT,
        order_by: ['backlinks,desc'],
      },
    ],
    fetchImplementation,
  });

  return { targets: parseBacklinkTargets(result), cost };
};
