import { type CrawledPage } from 'src/types/crawled-page';
import { type PageAssessment } from 'src/types/page-assessment';

export type CompetingPageCandidate = {
  url: string;
  title: string | null;
  pageType: string;
  searchIntent: string;
};

export const buildCompetingPageCandidates = (
  pages: CrawledPage[],
  assessments: PageAssessment[],
): CompetingPageCandidate[] => {
  const titleByUrl = new Map(pages.map((page) => [page.url, page.title]));

  return assessments.map((assessment) => ({
    url: assessment.url,
    title: titleByUrl.get(assessment.url) ?? null,
    pageType: assessment.pageType,
    searchIntent: assessment.searchIntent,
  }));
};

export const buildCompetingPagesInput = (candidates: CompetingPageCandidate[]): string =>
  [
    'Pages of one website:',
    '<pages>',
    ...candidates.map(
      (candidate, index) =>
        `${index}: ${candidate.title ?? '(no title)'} | ${candidate.url} | ${candidate.pageType} | ${candidate.searchIntent}`,
    ),
    '</pages>',
  ].join('\n');
