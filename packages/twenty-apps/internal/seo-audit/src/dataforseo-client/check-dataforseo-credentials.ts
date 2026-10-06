import { requestDataForSeo } from 'src/dataforseo-client/request-dataforseo';
import { type DataForSeoCredentials } from 'src/types/data-for-seo-credentials';
import { asFiniteNumber } from 'src/utils/as-finite-number.util';
import { asRecord } from 'src/utils/as-record.util';

type CheckDataForSeoCredentialsParams = {
  credentials: DataForSeoCredentials;
  fetchImplementation?: typeof fetch;
};

// Throws a DataForSeoError when DataForSEO refuses the credentials.
export const checkDataForSeoCredentials = async ({
  credentials,
  fetchImplementation,
}: CheckDataForSeoCredentialsParams): Promise<{ balance: number | null }> => {
  const { result } = await requestDataForSeo({
    credentials,
    path: '/v3/appendix/user_data',
    fetchImplementation,
  });

  return { balance: asFiniteNumber(asRecord(asRecord(result)?.money)?.balance) };
};
