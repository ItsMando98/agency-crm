import { type LighthouseSummary } from 'src/types/lighthouse-summary';
import { asFiniteNumber } from 'src/utils/as-finite-number.util';
import { asRecord } from 'src/utils/as-record.util';

const PERCENT = 100;
const CUMULATIVE_LAYOUT_SHIFT_PRECISION = 1_000;

const readAuditValue = (
  audits: Record<string, unknown> | null,
  auditId: string,
): number | null => asFiniteNumber(asRecord(audits?.[auditId])?.numericValue);

const asNonEmptyString = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null;

export const parseLighthouse = (
  result: unknown,
  fallbackUrl: string,
): LighthouseSummary | null => {
  const record = asRecord(result);

  if (record === null) {
    return null;
  }

  const audits = asRecord(record.audits);
  const largestContentfulPaint = readAuditValue(audits, 'largest-contentful-paint');
  const cumulativeLayoutShift = readAuditValue(audits, 'cumulative-layout-shift');
  const totalBlockingTime = readAuditValue(audits, 'total-blocking-time');
  const performanceScore = asFiniteNumber(
    asRecord(asRecord(record.categories)?.performance)?.score,
  );

  if (
    largestContentfulPaint === null &&
    cumulativeLayoutShift === null &&
    totalBlockingTime === null &&
    performanceScore === null
  ) {
    return null;
  }

  return {
    url:
      asNonEmptyString(record.finalUrl) ??
      asNonEmptyString(record.requestedUrl) ??
      fallbackUrl,
    performanceScore:
      performanceScore === null ? null : Math.round(performanceScore * PERCENT),
    largestContentfulPaintMs:
      largestContentfulPaint === null ? null : Math.round(largestContentfulPaint),
    cumulativeLayoutShift:
      cumulativeLayoutShift === null
        ? null
        : Math.round(cumulativeLayoutShift * CUMULATIVE_LAYOUT_SHIFT_PRECISION) /
          CUMULATIVE_LAYOUT_SHIFT_PRECISION,
    totalBlockingTimeMs:
      totalBlockingTime === null ? null : Math.round(totalBlockingTime),
    fetchedAt: asNonEmptyString(record.fetchTime),
  };
};
