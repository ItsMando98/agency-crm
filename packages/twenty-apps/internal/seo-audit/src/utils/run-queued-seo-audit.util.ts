import { randomBytes } from 'node:crypto';

import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { SEO_AUDIT_STATUS } from 'src/constants/seo-audit.constants';
import { type SeoAuditRecord } from 'src/types/seo-audit-record';
import { buildAuditExports } from 'src/utils/build-audit-exports.util';
import { buildAuditName } from 'src/utils/build-audit-name.util';
import { buildReportUrl } from 'src/utils/build-report-url.util';
import { getAnthropicClient } from 'src/utils/get-anthropic-client.util';
import { isBlankAuditDomain } from 'src/utils/is-blank-audit-domain.util';
import { normalizeAuditDomain } from 'src/utils/normalize-audit-domain.util';
import { persistSeoAuditResult } from 'src/utils/persist-seo-audit-result.util';
import { readAuditSettings } from 'src/utils/read-audit-settings.util';
import { readDataForSeoCredentials } from 'src/utils/read-dataforseo-credentials.util';
import { readTregCredentials } from 'src/utils/read-treg-credentials.util';
import { readPdfRendererSettings } from 'src/utils/read-pdf-renderer-settings.util';
import { readReportBaseUrl } from 'src/utils/read-report-base-url.util';
import { readReportBranding } from 'src/utils/read-report-branding.util';
import { runSeoAuditPipeline } from 'src/utils/run-seo-audit-pipeline.util';
import { uploadAuditFiles } from 'src/utils/upload-audit-files.util';

const MAX_FAILURE_REASON_LENGTH = 500;

type RunQueuedSeoAuditParams = {
  client: CoreApiClient;
  auditId: string;
  audit: SeoAuditRecord;
};

const failureReason = (error: unknown): string =>
  (error instanceof Error ? error.message : 'Audit failed').slice(
    0,
    MAX_FAILURE_REASON_LENGTH,
  );

const markFailed = async (
  client: CoreApiClient,
  auditId: string,
  error: unknown,
): Promise<void> => {
  await client.mutation({
    updateSeoAudit: {
      __args: {
        id: auditId,
        data: {
          status: SEO_AUDIT_STATUS.FAILED,
          failureReason: failureReason(error),
          finishedAt: new Date().toISOString(),
        },
      },
      id: true,
    },
  });
};

export const runQueuedSeoAudit = async ({
  client,
  auditId,
  audit,
}: RunQueuedSeoAuditParams): Promise<void> => {
  // A row added from the table has no website yet. Leave it queued.
  if (isBlankAuditDomain(audit.domain)) {
    return;
  }

  const startedAt = new Date();
  let origin: string;

  try {
    origin = normalizeAuditDomain(audit.domain ?? '');
  } catch (error) {
    await markFailed(client, auditId, error);
    return;
  }

  const anthropicClient = getAnthropicClient();
  const { defaultLanguage, maxPages, market, isAiVisibilityEnabled, isAiSummaryEnabled } =
    readAuditSettings();
  const dataForSeoCredentials = readDataForSeoCredentials();
  const tregCredentials = readTregCredentials();

  await client.mutation({
    updateSeoAudit: {
      __args: {
        id: auditId,
        data: {
          status: SEO_AUDIT_STATUS.RUNNING,
          startedAt: startedAt.toISOString(),
          failureReason: null,
          finishedAt: null,
        },
      },
      id: true,
    },
  });

  try {
    const result = await runSeoAuditPipeline({
      domain: origin,
      language: audit.language ?? defaultLanguage,
      anthropicClient,
      maxPages,
      market,
      dataForSeoCredentials,
      tregCredentials,
      isAiVisibilityEnabled,
      isAiSummaryEnabled,
    });

    const auditExports = await buildAuditExports({
      result,
      branding: readReportBranding(),
      pdfRenderer: readPdfRendererSettings(),
    });
    const uploadedFiles = await uploadAuditFiles({
      client: new MetadataApiClient(),
      exports: auditExports,
      origin: result.origin,
      generatedAt: result.generatedAt,
    });
    const shareToken = randomBytes(24).toString('hex');

    await persistSeoAuditResult({
      client,
      auditId,
      result,
      finishedAt: new Date(),
      exports: {
        reportHtml: auditExports.reportHtml,
        reportUrl: buildReportUrl({
          serverUrl: readReportBaseUrl(),
          auditId,
          shareToken,
        }),
        shareToken,
        excelFile: uploadedFiles.excelFile,
        pdfFile: uploadedFiles.pdfFile,
        notes: [...auditExports.notes, ...uploadedFiles.notes],
      },
    });

    if (!audit.name) {
      await client.mutation({
        updateSeoAudit: {
          __args: {
            id: auditId,
            data: { name: buildAuditName(origin, startedAt) },
          },
          id: true,
        },
      });
    }
  } catch (error) {
    await markFailed(client, auditId, error);
  }
};
