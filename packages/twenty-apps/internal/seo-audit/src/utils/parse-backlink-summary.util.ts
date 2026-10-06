import { type BacklinkSummary } from 'src/types/backlink-summary';
import { asFiniteNumber } from 'src/utils/as-finite-number.util';
import { asRecord } from 'src/utils/as-record.util';

export const parseBacklinkSummary = (result: unknown): BacklinkSummary | null => {
  const record = asRecord(result);
  const backlinks = asFiniteNumber(record?.backlinks);

  if (record === null || backlinks === null) {
    return null;
  }

  return {
    backlinks,
    referringDomains: asFiniteNumber(record.referring_domains) ?? 0,
    brokenBacklinks: asFiniteNumber(record.broken_backlinks),
    brokenPages: asFiniteNumber(record.broken_pages),
    rank: asFiniteNumber(record.rank),
  };
};
