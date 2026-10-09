import { CORE_WEB_VITALS_DETAIL_LABELS } from 'src/constants/core-web-vitals-detail-labels.const';
import {
  CUMULATIVE_LAYOUT_SHIFT_GOOD,
  LARGEST_CONTENTFUL_PAINT_GOOD_MS,
  LARGEST_CONTENTFUL_PAINT_POOR_MS,
  TOTAL_BLOCKING_TIME_GOOD_MS,
} from 'src/constants/seo-thresholds.const';
import { type AuditLanguage } from 'src/types/audit-language';
import { type Finding } from 'src/types/finding';
import { type LighthouseSummary } from 'src/types/lighthouse-summary';
import { formatDecimal } from 'src/utils/format-decimal.util';
import { formatNumber } from 'src/utils/format-number.util';

type CheckCoreWebVitalsParams = {
  lighthouse: LighthouseSummary | null;
  language: AuditLanguage;
};

const MILLISECONDS_PER_SECOND = 1_000;

export const checkCoreWebVitals = ({
  lighthouse,
  language,
}: CheckCoreWebVitalsParams): Finding[] => {
  if (lighthouse === null) {
    return [];
  }

  const labels = CORE_WEB_VITALS_DETAIL_LABELS[language];
  const { url } = lighthouse;
  const findings: Finding[] = [];
  const {
    largestContentfulPaintMs,
    cumulativeLayoutShift,
    totalBlockingTimeMs,
  } = lighthouse;

  if (
    largestContentfulPaintMs !== null &&
    largestContentfulPaintMs > LARGEST_CONTENTFUL_PAINT_GOOD_MS
  ) {
    findings.push({
      ruleId:
        largestContentfulPaintMs > LARGEST_CONTENTFUL_PAINT_POOR_MS
          ? 'LCP_VERY_SLOW'
          : 'LCP_SLOW',
      affectedUrls: [],
      details: [
        labels.largestContentfulPaint({
          url,
          value: formatDecimal(largestContentfulPaintMs / MILLISECONDS_PER_SECOND, language, 1),
          target: formatDecimal(LARGEST_CONTENTFUL_PAINT_GOOD_MS / MILLISECONDS_PER_SECOND, language, 1),
        }),
      ],
    });
  }

  if (
    cumulativeLayoutShift !== null &&
    cumulativeLayoutShift > CUMULATIVE_LAYOUT_SHIFT_GOOD
  ) {
    findings.push({
      ruleId: 'CLS_HIGH',
      affectedUrls: [],
      details: [
        labels.cumulativeLayoutShift({
          url,
          value: formatDecimal(cumulativeLayoutShift, language, 2),
          target: formatDecimal(CUMULATIVE_LAYOUT_SHIFT_GOOD, language, 1),
        }),
      ],
    });
  }

  if (
    totalBlockingTimeMs !== null &&
    totalBlockingTimeMs > TOTAL_BLOCKING_TIME_GOOD_MS
  ) {
    findings.push({
      ruleId: 'TBT_HIGH',
      affectedUrls: [],
      details: [
        labels.totalBlockingTime({
          url,
          value: formatNumber(totalBlockingTimeMs, language),
          target: formatNumber(TOTAL_BLOCKING_TIME_GOOD_MS, language),
        }),
      ],
    });
  }

  return findings;
};
