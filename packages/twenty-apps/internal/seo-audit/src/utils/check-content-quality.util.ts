import {
  LOW_SCORE_THRESHOLD,
  THIN_CONTENT_WORD_COUNT,
} from 'src/constants/seo-thresholds.const';
import { type CrawledPage } from 'src/types/crawled-page';
import { type Finding } from 'src/types/finding';
import { type PageAssessment } from 'src/types/page-assessment';
import { isAuditablePage } from 'src/utils/is-auditable-page.util';

const PAGE_TYPES_EXEMPT_FROM_THIN_CONTENT = ['CONTACT', 'LEGAL'];

export const checkContentQuality = (
  pages: CrawledPage[],
  assessments: PageAssessment[],
): Finding[] => {
  const exemptUrls = new Set(
    assessments
      .filter((assessment) =>
        PAGE_TYPES_EXEMPT_FROM_THIN_CONTENT.includes(assessment.pageType),
      )
      .map((assessment) => assessment.url),
  );
  const thinContentUrls = pages
    .filter(
      (page) =>
        isAuditablePage(page) &&
        page.wordCount < THIN_CONTENT_WORD_COUNT &&
        !exemptUrls.has(page.url),
    )
    .map((page) => page.url);

  // Uncertain assessments are listed for manual review instead of being counted.
  const confidentAssessments = assessments.filter(
    (assessment) => !assessment.needsReview,
  );
  const urlsWhereLow = (
    getScore: (assessment: PageAssessment) => number,
  ): string[] =>
    confidentAssessments
      .filter((assessment) => getScore(assessment) <= LOW_SCORE_THRESHOLD)
      .map((assessment) => assessment.url);

  const findings: Finding[] = [
    { ruleId: 'THIN_CONTENT', affectedUrls: thinContentUrls },
    {
      ruleId: 'LOW_HELPFULNESS',
      affectedUrls: urlsWhereLow((assessment) => assessment.helpfulness),
    },
    {
      ruleId: 'LOW_SPECIFICITY',
      affectedUrls: urlsWhereLow((assessment) => assessment.specificity),
    },
    {
      ruleId: 'LOW_TRUST',
      affectedUrls: urlsWhereLow((assessment) => assessment.trust),
    },
  ];

  return findings.filter((finding) => finding.affectedUrls.length > 0);
};
