import { type AuditLanguage } from 'src/types/audit-language';

type MeasuredValue = { url: string; value: string; target: string };

type CoreWebVitalsDetailLabels = {
  largestContentfulPaint: (measured: MeasuredValue) => string;
  cumulativeLayoutShift: (measured: MeasuredValue) => string;
  totalBlockingTime: (measured: MeasuredValue) => string;
};

export const CORE_WEB_VITALS_DETAIL_LABELS: Record<
  AuditLanguage,
  CoreWebVitalsDetailLabels
> = {
  DE: {
    largestContentfulPaint: ({ url, value, target }) =>
      `${url}: LCP ${value} s (Ziel: unter ${target} s)`,
    cumulativeLayoutShift: ({ url, value, target }) =>
      `${url}: CLS ${value} (Ziel: unter ${target})`,
    totalBlockingTime: ({ url, value, target }) =>
      `${url}: TBT ${value} ms (Ziel: unter ${target} ms)`,
  },
  EN: {
    largestContentfulPaint: ({ url, value, target }) =>
      `${url}: LCP ${value} s (target: under ${target} s)`,
    cumulativeLayoutShift: ({ url, value, target }) =>
      `${url}: CLS ${value} (target: under ${target})`,
    totalBlockingTime: ({ url, value, target }) =>
      `${url}: TBT ${value} ms (target: under ${target} ms)`,
  },
};
