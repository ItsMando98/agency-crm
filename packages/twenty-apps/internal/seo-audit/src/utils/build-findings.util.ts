import { type CrawlResult } from 'src/types/crawl-result';
import { type Finding } from 'src/types/finding';
import { type PageAssessment } from 'src/types/page-assessment';
import { type SiteProfile } from 'src/types/site-profile';
import { checkContentQuality } from 'src/utils/check-content-quality.util';
import { checkCrawlability } from 'src/utils/check-crawlability.util';
import { checkLinks } from 'src/utils/check-links.util';
import { checkOnPage } from 'src/utils/check-on-page.util';
import { checkPerformance } from 'src/utils/check-performance.util';
import { checkSecurity } from 'src/utils/check-security.util';
import { checkStructuredData } from 'src/utils/check-structured-data.util';

type BuildFindingsParams = {
  crawlResult: CrawlResult;
  assessments: PageAssessment[];
  siteProfile: SiteProfile | null;
};

export const buildFindings = ({
  crawlResult,
  assessments,
  siteProfile,
}: BuildFindingsParams): Finding[] => [
  ...checkCrawlability(crawlResult),
  ...checkOnPage(crawlResult.pages),
  ...checkLinks(crawlResult),
  ...checkSecurity(crawlResult),
  ...checkPerformance(crawlResult.pages),
  ...checkStructuredData(crawlResult.pages, siteProfile),
  ...checkContentQuality(crawlResult.pages, assessments),
];
