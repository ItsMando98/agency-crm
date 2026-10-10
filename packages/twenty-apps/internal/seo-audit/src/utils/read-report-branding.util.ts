import {
  REPORT_ACCENT_COLOR_VARIABLE_KEY,
  REPORT_BOOKING_URL_VARIABLE_KEY,
  REPORT_BRAND_NAME_VARIABLE_KEY,
} from 'src/constants/application-variable-keys.const';
import { DEFAULT_ACCENT_COLOR } from 'src/constants/report.const';
import { type ReportBranding } from 'src/types/report-branding';

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const MAX_BRAND_NAME_LENGTH = 80;

const readHttpsUrl = (value: string | undefined): string | null => {
  if (value === undefined || value === '') {
    return null;
  }

  try {
    const url = new URL(value);

    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
};

export const readReportBranding = (
  environment: Record<string, string | undefined> = process.env,
): ReportBranding => {
  const brandName = environment[REPORT_BRAND_NAME_VARIABLE_KEY]?.trim();
  const accentColor = environment[REPORT_ACCENT_COLOR_VARIABLE_KEY]?.trim();

  return {
    brandName:
      brandName === undefined || brandName === ''
        ? null
        : brandName.slice(0, MAX_BRAND_NAME_LENGTH),
    accentColor:
      accentColor !== undefined && HEX_COLOR_PATTERN.test(accentColor)
        ? accentColor
        : DEFAULT_ACCENT_COLOR,
    bookingUrl: readHttpsUrl(environment[REPORT_BOOKING_URL_VARIABLE_KEY]?.trim()),
  };
};
