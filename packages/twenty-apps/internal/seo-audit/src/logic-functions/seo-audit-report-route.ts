import { timingSafeEqual } from 'node:crypto';

import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { REPORT_ROUTE_PATH } from 'src/constants/report.const';

const notFound = (): Response =>
  new Response('Not found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });

const tokensMatch = (expected: string, provided: string): boolean => {
  const expectedBytes = Buffer.from(expected);
  const providedBytes = Buffer.from(provided);

  return (
    expectedBytes.length === providedBytes.length &&
    timingSafeEqual(expectedBytes, providedBytes)
  );
};

// Serves the stored report page behind an unguessable share token. Every miss
// answers the same 404, so the link reveals nothing about other audits.
const handler = async (event: RoutePayload): Promise<Response> => {
  const auditId = event.queryStringParameters?.id;
  const token = event.queryStringParameters?.token;

  if (!auditId || !token) {
    return notFound();
  }

  const client = new CoreApiClient();
  const { seoAudits } = await client.query({
    seoAudits: {
      __args: { filter: { id: { eq: auditId } }, first: 1 },
      edges: { node: { id: true, reportHtml: true, shareToken: true } },
    },
  });
  const audit = seoAudits?.edges?.[0]?.node;

  if (
    !audit?.reportHtml ||
    !audit.shareToken ||
    !tokensMatch(audit.shareToken, token)
  ) {
    return notFound();
  }

  // The server only passes content-type and cache-control through. The page
  // carries its own Content-Security-Policy.
  return new Response(audit.reportHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
    },
  });
};

export default defineLogicFunction({
  universalIdentifier: 'c043f06c-73da-48fa-a580-503dbd85d45e',
  name: 'seo-audit-report',
  description:
    'Serves the print-ready HTML report of an SEO audit for people with the share link.',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: REPORT_ROUTE_PATH,
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
