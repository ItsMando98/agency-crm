import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type AuditLanguage } from 'src/types/audit-language';
import { type LighthouseSummary } from 'src/types/lighthouse-summary';
import { formatDecimal } from 'src/utils/format-decimal.util';
import { formatNumber } from 'src/utils/format-number.util';

type LighthouseDisplayRow = { label: string; value: string };

const MILLISECONDS_PER_SECOND = 1_000;

export const buildLighthouseDisplayRows = (
  lighthouse: LighthouseSummary,
  language: AuditLanguage,
): LighthouseDisplayRow[] => {
  const labels = REPORT_LABELS[language];
  const {
    performanceScore,
    largestContentfulPaintMs,
    cumulativeLayoutShift,
    totalBlockingTimeMs,
  } = lighthouse;
  const rows: LighthouseDisplayRow[] = [];

  if (performanceScore !== null) {
    rows.push({ label: labels.performanceScore, value: String(performanceScore) });
  }

  if (largestContentfulPaintMs !== null) {
    rows.push({
      label: labels.largestContentfulPaint,
      value: `${formatDecimal(largestContentfulPaintMs / MILLISECONDS_PER_SECOND, language, 1)} s`,
    });
  }

  if (cumulativeLayoutShift !== null) {
    rows.push({
      label: labels.layoutShift,
      value: formatDecimal(cumulativeLayoutShift, language, 2),
    });
  }

  if (totalBlockingTimeMs !== null) {
    rows.push({
      label: labels.blockingTime,
      value: `${formatNumber(totalBlockingTimeMs, language)} ms`,
    });
  }

  return rows;
};
