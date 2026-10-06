import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SEO_AUDIT_STATUS } from 'src/constants/seo-audit.constants';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { buildKeywordRecordData } from 'src/utils/build-keyword-record-data.util';
import { buildMarketAuditData } from 'src/utils/build-market-audit-data.util';
import { buildPageRecordData } from 'src/utils/build-page-record-data.util';
import { buildTaskRecordData } from 'src/utils/build-task-record-data.util';
import { selectKeywordRecords } from 'src/utils/select-keyword-records.util';

type PersistSeoAuditResultParams = {
  client: CoreApiClient;
  auditId: string;
  result: SeoAuditResult;
  finishedAt: Date;
};

export const persistSeoAuditResult = async ({
  client,
  auditId,
  result,
  finishedAt,
}: PersistSeoAuditResultParams): Promise<void> => {
  const assessmentByUrl = new Map(
    result.assessments.map((assessment) => [assessment.url, assessment]),
  );

  if (result.pages.length > 0) {
    await client.mutation({
      createSeoAuditPages: {
        __args: {
          data: result.pages.map((page) =>
            buildPageRecordData(auditId, page, assessmentByUrl.get(page.url)),
          ),
        },
        id: true,
      },
    });
  }

  if (result.tasks.length > 0) {
    await client.mutation({
      createSeoAuditTasks: {
        __args: {
          data: result.tasks.map((task) => buildTaskRecordData(auditId, task)),
        },
        id: true,
      },
    });
  }

  const keywordRecords = selectKeywordRecords(result.keywords);

  if (keywordRecords.length > 0) {
    await client.mutation({
      createSeoKeywordOpportunities: {
        __args: {
          data: keywordRecords.map((keyword) => buildKeywordRecordData(auditId, keyword)),
        },
        id: true,
      },
    });
  }

  await client.mutation({
    updateSeoAudit: {
      __args: {
        id: auditId,
        data: {
          status: SEO_AUDIT_STATUS.DONE,
          score: result.score,
          grade: result.grade,
          pagesCrawled: result.pages.length,
          areaScores: result.areaScores,
          reportMarkdown: result.reportMarkdown,
          finishedAt: finishedAt.toISOString(),
          failureReason: null,
          ...buildMarketAuditData(result.marketData),
        },
      },
      id: true,
    },
  });
};
