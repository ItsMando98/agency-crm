import { type ScoreBand } from 'src/types/score-band';

export type ReportHtmlLabels = {
  documentTitle: string;
  preparedBy: string;
  overallScore: string;
  outOf: string;
  gradeLabel: string;
  kpiPages: string;
  kpiTasks: string;
  kpiCritical: string;
  kpiKeywords: string;
  kpiTraffic: string;
  kpiBacklinks: string;
  kpiDomains: string;
  areasIntro: string;
  bands: Record<ScoreBand, string>;
  summarySentence: (
    strongest: string,
    strongestScore: number,
    weakest: string,
    weakestScore: number,
  ) => string;
  horizonHints: { WEEK: string; MONTH: string; QUARTER: string };
  effort: string;
  contentNotAssessed: string;
  printHint: string;
  printButton: string;
  pageWord: string;
  brokenBacklinksHeading: string;
  backlinksColumn: string;
  domainsColumn: string;
  reviewKeywordsHeading: string;
  reviewPagesHeading: string;
  moreItems: (count: number) => string;
};
