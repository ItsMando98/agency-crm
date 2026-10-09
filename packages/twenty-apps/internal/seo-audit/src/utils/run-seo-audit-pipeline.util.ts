import type Anthropic from '@anthropic-ai/sdk';

import { assessKeywords } from 'src/anthropic-client/assess-keywords';
import { assessPage } from 'src/anthropic-client/assess-page';
import { assessSiteProfile } from 'src/anthropic-client/assess-site-profile';
import { CLASSIFIER_CONCURRENCY } from 'src/constants/classifier.const';
import { DEFAULT_MARKET } from 'src/constants/dataforseo.const';
import { MAX_CLASSIFIED_KEYWORDS } from 'src/constants/seo-thresholds.const';
import { collectMarketData } from 'src/dataforseo-client/collect-market-data';
import { type AuditLanguage } from 'src/types/audit-language';
import { type BacklinkTarget } from 'src/types/backlink-target';
import { type DataForSeoCredentials } from 'src/types/data-for-seo-credentials';
import { type KeywordAssessment } from 'src/types/keyword-assessment';
import { type Market } from 'src/types/market';
import { type MarketData } from 'src/types/market-data';
import { type PageAssessment } from 'src/types/page-assessment';
import { type ScoredKeyword } from 'src/types/scored-keyword';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { type SiteProfile } from 'src/types/site-profile';
import { buildAuditTasks } from 'src/utils/build-audit-tasks.util';
import { buildFindings } from 'src/utils/build-findings.util';
import { buildReportMarkdown } from 'src/utils/build-report-markdown.util';
import { computeAreaScores } from 'src/utils/compute-area-scores.util';
import { computeOverallScore } from 'src/utils/compute-overall-score.util';
import { crawlWebsite } from 'src/utils/crawl-website.util';
import { evaluateAiReadiness } from 'src/utils/evaluate-ai-readiness.util';
import { isAuditablePage } from 'src/utils/is-auditable-page.util';
import { normalizeAuditDomain } from 'src/utils/normalize-audit-domain.util';
import { resolveBrokenBacklinkTargets } from 'src/utils/resolve-broken-backlink-targets.util';
import { runAiVisibility } from 'src/utils/run-ai-visibility.util';
import { runWithConcurrency } from 'src/utils/run-with-concurrency.util';
import { scoreKeywords } from 'src/utils/score-keywords.util';
import { scoreToGrade } from 'src/utils/score-to-grade.util';

type RunSeoAuditPipelineParams = {
  domain: string;
  language: AuditLanguage;
  // Without a client the audit runs on measured rules only.
  anthropicClient: Anthropic | null;
  // Without credentials the audit skips rankings, keywords and backlinks.
  dataForSeoCredentials?: DataForSeoCredentials | null;
  market?: Market;
  maxPages?: number;
  // Paid: asks AI assistants typical customer questions and checks who they name.
  isAiVisibilityEnabled?: boolean;
  fetchImplementation?: typeof fetch;
  now?: Date;
};

const MAX_PAGE_TITLES_IN_CONTEXT = 20;

export const runSeoAuditPipeline = async ({
  domain,
  language,
  anthropicClient,
  dataForSeoCredentials = null,
  market = DEFAULT_MARKET,
  maxPages,
  isAiVisibilityEnabled = false,
  fetchImplementation,
  now = new Date(),
}: RunSeoAuditPipelineParams): Promise<SeoAuditResult> => {
  const origin = normalizeAuditDomain(domain);
  const crawlResult = await crawlWebsite({ origin, maxPages, fetchImplementation });
  const auditablePages = crawlResult.pages.filter(isAuditablePage);
  const aiReadiness = evaluateAiReadiness(crawlResult);
  const [homepage] = crawlResult.pages;
  const classifierErrors: string[] = [];
  const recordClassifierError = (message: string): void => {
    classifierErrors.push(message);
  };

  const siteProfilePromise =
    anthropicClient !== null && isAuditablePage(homepage)
      ? assessSiteProfile({ client: anthropicClient, homepage, onError: recordClassifierError })
      : Promise.resolve<SiteProfile | null>(null);

  // The questions need the site profile, so this starts as soon as it is known
  // and runs next to the page classifier and the market data.
  const aiVisibilityPromise = siteProfilePromise.then((profile) =>
    runAiVisibility({
      isEnabled: isAiVisibilityEnabled,
      anthropicClient,
      credentials: dataForSeoCredentials,
      origin: crawlResult.origin,
      homepage,
      auditablePages,
      siteProfile: profile,
      market,
      now,
      fetchImplementation,
    }),
  );

  const [siteProfile, assessments, marketData, aiVisibility] = await Promise.all([
    siteProfilePromise,
    anthropicClient === null
      ? Promise.resolve<PageAssessment[]>([])
      : runWithConcurrency(auditablePages, CLASSIFIER_CONCURRENCY, (page) =>
          assessPage({ client: anthropicClient, page, onError: recordClassifierError }),
        ).then((results) =>
          results.filter((result): result is PageAssessment => result !== null),
        ),
    dataForSeoCredentials === null
      ? Promise.resolve<MarketData | null>(null)
      : collectMarketData({
          credentials: dataForSeoCredentials,
          origin: crawlResult.origin,
          market,
          fetchImplementation,
        }),
    aiVisibilityPromise,
  ]);

  let keywords: ScoredKeyword[] = [];

  if (marketData?.rankings) {
    const classifiedKeywords = [...marketData.rankings.keywords]
      .sort((first, second) => second.searchVolume - first.searchVolume)
      .slice(0, MAX_CLASSIFIED_KEYWORDS);
    let keywordAssessments: KeywordAssessment[] = [];

    if (anthropicClient === null) {
      marketData.notes.push('Keyword relevance was not judged because no Anthropic key is configured.');
    } else {
      keywordAssessments = await assessKeywords({
        client: anthropicClient,
        keywords: classifiedKeywords.map((keyword) => keyword.keyword),
        onError: recordClassifierError,
        context: {
          title: homepage.title,
          metaDescription: homepage.metaDescription,
          businessModel: siteProfile?.businessModel ?? null,
          pageTitles: auditablePages
            .map((page) => page.title)
            .filter((title): title is string => title !== null)
            .slice(0, MAX_PAGE_TITLES_IN_CONTEXT),
        },
      });
    }

    keywords = scoreKeywords(classifiedKeywords, keywordAssessments);
  }

  const brokenBacklinkTargets: BacklinkTarget[] =
    marketData !== null && marketData.backlinkTargets.length > 0
      ? await resolveBrokenBacklinkTargets({
          targets: marketData.backlinkTargets,
          crawlResult,
          fetchImplementation,
        })
      : [];

  const notes =
    classifierErrors.length === 0
      ? []
      : [
          `Content classifier: ${classifierErrors.length} requests failed. First error: ${classifierErrors[0]}`,
        ];

  const findings = buildFindings({
    crawlResult,
    assessments,
    siteProfile,
    language,
    marketData,
    keywords,
    brokenBacklinkTargets,
    aiReadiness,
    aiVisibility,
  });
  const areaScores = computeAreaScores({
    findings,
    assessments,
    pageCount: crawlResult.pages.length,
    keywords,
    aiReadiness,
    aiVisibility,
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
    marketData,
    keywords,
    isMarketDataConfigured: dataForSeoCredentials !== null,
    aiReadiness,
    aiVisibility,
  });

  return {
    origin: crawlResult.origin,
    language,
    generatedAt: now.toISOString(),
    brokenBacklinkTargets,
    aiReadiness,
    aiVisibility,
    notes,
    score,
    grade,
    areaScores,
    pages: crawlResult.pages,
    assessments,
    tasks,
    marketData,
    keywords,
    reportMarkdown,
  };
};
