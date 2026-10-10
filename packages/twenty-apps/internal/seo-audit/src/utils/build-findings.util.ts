import { type AiReadiness } from 'src/types/ai-readiness';
import { type CompetingPageGroup, type MissingLocation } from 'src/types/audit-insights';
import { type AiVisibility } from 'src/types/ai-visibility';
import { type AuditLanguage } from 'src/types/audit-language';
import { type BacklinkTarget } from 'src/types/backlink-target';
import { type CrawlResult } from 'src/types/crawl-result';
import { type Finding } from 'src/types/finding';
import { type MarketData } from 'src/types/market-data';
import { type PageAssessment } from 'src/types/page-assessment';
import { type ScoredKeyword } from 'src/types/scored-keyword';
import { type SiteProfile } from 'src/types/site-profile';
import { checkAiPresence } from 'src/utils/check-ai-presence.util';
import { checkAiReadiness } from 'src/utils/check-ai-readiness.util';
import { checkContentQuality } from 'src/utils/check-content-quality.util';
import { checkCoreWebVitals } from 'src/utils/check-core-web-vitals.util';
import { checkCrawlability } from 'src/utils/check-crawlability.util';
import { checkLinks } from 'src/utils/check-links.util';
import { checkOnPage } from 'src/utils/check-on-page.util';
import { checkPerformance } from 'src/utils/check-performance.util';
import { checkSecurity } from 'src/utils/check-security.util';
import { checkStructuredData } from 'src/utils/check-structured-data.util';
import { checkVisibility } from 'src/utils/check-visibility.util';

type BuildFindingsParams = {
  crawlResult: CrawlResult;
  assessments: PageAssessment[];
  siteProfile: SiteProfile | null;
  language: AuditLanguage;
  marketData?: MarketData | null;
  keywords?: ScoredKeyword[];
  brokenBacklinkTargets?: BacklinkTarget[];
  aiReadiness?: AiReadiness | null;
  aiVisibility?: AiVisibility | null;
  missingLocations?: MissingLocation[];
  competingPages?: CompetingPageGroup[];
};

export const buildFindings = ({
  crawlResult,
  assessments,
  siteProfile,
  language,
  marketData = null,
  keywords = [],
  brokenBacklinkTargets = [],
  aiReadiness = null,
  aiVisibility = null,
  missingLocations = [],
  competingPages = [],
}: BuildFindingsParams): Finding[] => [
  ...checkCrawlability(crawlResult),
  ...checkOnPage(crawlResult.pages),
  ...checkLinks(crawlResult),
  ...checkSecurity(crawlResult),
  ...checkPerformance(crawlResult.pages),
  ...checkCoreWebVitals({ lighthouse: marketData?.lighthouse ?? null, language }),
  ...checkStructuredData(crawlResult.pages, siteProfile),
  ...checkContentQuality(crawlResult.pages, assessments),
  ...checkVisibility({ marketData, keywords, brokenBacklinkTargets, language, missingLocations }),
  ...(competingPages.length === 0
    ? []
    : [
        {
          ruleId: 'COMPETING_PAGES' as const,
          affectedUrls: competingPages.flatMap((group) => group.urls),
          count: competingPages.length,
          details: competingPages.map((group) => `${group.topic} (${group.urls.length})`),
        },
      ]),
  ...(aiReadiness === null ? [] : checkAiReadiness({ aiReadiness, language })),
  ...checkAiPresence({ aiVisibility, language }),
];
