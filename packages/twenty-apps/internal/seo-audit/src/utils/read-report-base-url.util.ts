import { REPORT_PUBLIC_URL_VARIABLE_KEY } from 'src/constants/application-variable-keys.const';

// The public route finds its workspace from the request host, so installations
// with one subdomain per workspace set the workspace URL explicitly.
export const readReportBaseUrl = (
  environment: Record<string, string | undefined> = process.env,
): string | undefined => {
  const configuredUrl = environment[REPORT_PUBLIC_URL_VARIABLE_KEY]?.trim();

  return configuredUrl === undefined || configuredUrl === ''
    ? environment.TWENTY_API_URL
    : configuredUrl;
};
