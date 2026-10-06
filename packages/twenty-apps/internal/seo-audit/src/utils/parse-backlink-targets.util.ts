import { type BacklinkTarget } from 'src/types/backlink-target';
import { asFiniteNumber } from 'src/utils/as-finite-number.util';
import { asRecord } from 'src/utils/as-record.util';

export const parseBacklinkTargets = (result: unknown): BacklinkTarget[] => {
  const items = asRecord(result)?.items;

  if (!Array.isArray(items)) {
    return [];
  }

  return items.flatMap((item): BacklinkTarget[] => {
    const record = asRecord(item);
    const url = record?.url ?? record?.page;

    if (record === null || typeof url !== 'string' || url === '') {
      return [];
    }

    return [
      {
        url,
        backlinks: asFiniteNumber(record.backlinks) ?? 0,
        referringDomains: asFiniteNumber(record.referring_domains) ?? 0,
      },
    ];
  });
};
