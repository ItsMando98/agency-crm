import { REPORT_ROUTE_PATH } from 'src/constants/report.const';

type BuildReportUrlParams = {
  serverUrl: string | undefined;
  auditId: string;
  shareToken: string;
};

// The route is served by the Twenty server under /s. Without a server URL no
// link is stored, so the audit still completes.
export const buildReportUrl = ({
  serverUrl,
  auditId,
  shareToken,
}: BuildReportUrlParams): string | null => {
  if (serverUrl === undefined || serverUrl.trim() === '') {
    return null;
  }

  const url = new URL(`/s${REPORT_ROUTE_PATH}`, serverUrl);

  url.searchParams.set('id', auditId);
  url.searchParams.set('token', shareToken);

  return url.toString();
};
