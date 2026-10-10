type BuildReportLinkParams = {
  publicBaseUrl: string;
  auditId: string;
  shareToken: string | null;
};

// The stored report link uses the server address, which is not the address of
// the workspace. The public route only resolves on the workspace address.
export const buildReportLink = ({
  publicBaseUrl,
  auditId,
  shareToken,
}: BuildReportLinkParams): string | null => {
  if (shareToken === null || shareToken === '') {
    return null;
  }

  const url = new URL('/s/seo-audit/report', publicBaseUrl);

  url.searchParams.set('id', auditId);
  url.searchParams.set('token', shareToken);

  return url.toString();
};
