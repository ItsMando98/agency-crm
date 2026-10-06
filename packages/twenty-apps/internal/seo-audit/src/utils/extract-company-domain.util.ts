import { asRecord } from 'src/utils/as-record.util';

export const extractCompanyDomain = (company: unknown): string | null => {
  const url = asRecord(asRecord(company)?.domainName)?.primaryLinkUrl;

  return typeof url === 'string' && url.trim() !== '' ? url.trim() : null;
};
