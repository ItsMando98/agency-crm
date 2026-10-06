import {
  GENERIC_COMPETITOR_DOMAINS,
  MAX_SHOWN_COMPETITORS,
} from 'src/constants/dataforseo.const';
import { type Competitor } from 'src/types/competitor';
import { asFiniteNumber } from 'src/utils/as-finite-number.util';
import { asRecord } from 'src/utils/as-record.util';

const isGenericDomain = (domain: string): boolean =>
  GENERIC_COMPETITOR_DOMAINS.some(
    (generic) => domain === generic || domain.endsWith(`.${generic}`),
  );

export const parseCompetitors = (
  result: unknown,
  ownDomain: string,
): Competitor[] => {
  const items = asRecord(result)?.items;

  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .flatMap((item): Competitor[] => {
      const record = asRecord(item);
      const domain = record?.domain;

      if (
        record === null ||
        typeof domain !== 'string' ||
        domain === ownDomain ||
        isGenericDomain(domain)
      ) {
        return [];
      }

      const organicMetrics =
        asRecord(asRecord(record.metrics)?.organic) ??
        asRecord(asRecord(record.full_domain_metrics)?.organic);

      return [
        {
          domain,
          commonKeywords: asFiniteNumber(record.intersections) ?? 0,
          estimatedTraffic: asFiniteNumber(organicMetrics?.etv) ?? 0,
        },
      ];
    })
    .sort((first, second) => second.commonKeywords - first.commonKeywords)
    .slice(0, MAX_SHOWN_COMPETITORS);
};
