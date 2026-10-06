import { describe, expect, it } from 'vitest';

import { formatReportDate } from 'src/utils/format-report-date.util';

describe('formatReportDate', () => {
  it('formats German dates day first and English dates as ISO', () => {
    expect(formatReportDate('2026-10-06T10:00:00.000Z', 'DE')).toBe('06.10.2026');
    expect(formatReportDate('2026-10-06T10:00:00.000Z', 'EN')).toBe('2026-10-06');
  });
});
