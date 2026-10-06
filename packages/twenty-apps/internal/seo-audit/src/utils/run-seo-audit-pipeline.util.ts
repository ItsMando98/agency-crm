import type Anthropic from '@anthropic-ai/sdk';

import { assessPage } from 'src/anthropic-client/assess-page';
import { assessSiteProfile } from 'src/anthropic-client/assess-site-profile';
import { CLASSIFIER_CONCURRENCY } from 'src/constants/classifier.const';
import { type AuditLanguage } from 'src/types/audit-language';
import { type PageAssessment } from 'src/types/page-assessment';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { type SiteProfile } from 'src/types/site-profile';
import { buildAuditTasks } from 'src/utils/build-audit-tasks.util';
import { buildFindings } from 'src/utils/build-findings.util';
import { buildReportMarkdown } from 'src/utils/build-report-markdown.util';
import { computeAreaScores } from 'src/utils/compute-area-scores.util';
import { computeOverallScore } from 'src/utils/compute-overall-score.util';
import { crawlWebsite } from 'src/utils/crawl-website.util';
import { isAuditablePage } from 'src/utils/is-auditable-page.util';
import { normalizeAuditDomain } from 'src/utils/normalize-audit-domain.util';
import { runWithConcurrency } from 'src/utils/run-with-concurrency.util';
import { scoreToGrade } from 'src/utils/score-to-grade.util';

type RunSeoAuditPipelineParams = {
  domain: string;
  language: AuditLanguage;
  // Without a client the audit runs on measured rules only.
  anthropicClient: Anthropic | null;
  maxPages?: number;
  fetchImplementation?: typeof fetch;
  now?: Date;
};

export const runSeoAuditPipeline = async ({
  domain,
  language,
  anthropicClient,
  maxPages,
  fetchImplementation,
  now = new Date(),
}: RunSeoAuditPipelineParams): Promise<SeoAuditResult> => {
  const origin = normalizeAuditDomain(domain);
  const crawlResult = await crawlWebsite({ origin, maxPages, fetchImplementation });
  const auditablePages = crawlResult.pages.filter(isAuditablePage);

  let siteProfile: SiteProfile | null = null;
  let assessments: PageAssessment[] = [];

  if (anthropicClient !== null) {
    const [homepage] = crawlResult.pages;

    [siteProfile, assessments] = await Promise.all([
      isAuditablePage(homepage)
        ? assessSiteProfile({ client: anthropicClient, homepage })
        : Promise.resolve(null),
      runWithConcurrency(auditablePages, CLASSIFIER_CONCURRENCY, (page) =>
        assessPage({ client: anthropicClient, page }),
      ).then((results) =>
        results.filter((result): result is PageAssessment => result !== null),
      ),
    ]);
  }

  const findings = buildFindings({ crawlResult, assessments, siteProfile });
  const areaScores = computeAreaScores({
    findings,
    assessments,
    pageCount: crawlResult.pages.length,
  });
  const score = computeOverallScore(areaScores);
  const grade = scoreToGrade(score);
  const tasks = buildAuditTasks(findings, language);
  const reportMarkdown = buildReportMarkdown({
    origin: crawlResult.origin,
    language,
    generatedAt: now,
    score,
    grade,
    areaScores,
    pageCount: crawlResult.pages.length,
    tasks,
    assessments,
    contentQualityAssessed: assessments.length > 0,
  });

  return {
    score,
    grade,
    areaScores,
    pages: crawlResult.pages,
    assessments,
    tasks,
    reportMarkdown,
  };
};
