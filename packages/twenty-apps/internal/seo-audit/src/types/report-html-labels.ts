import { type ScoreBand } from 'src/types/score-band';

export type ReportHtmlLabels = {
  documentTitle: string;
  overallScore: string;
  kpiPages: string;
  kpiTasks: string;
  kpiCritical: string;
  kpiKeywords: string;
  kpiTraffic: string;
  kpiBacklinks: string;
  kpiDomains: string;
  bands: Record<ScoreBand, string>;
  summarySentence: (
    strongest: string,
    strongestScore: number,
    weakest: string,
    weakestScore: number,
  ) => string;
  horizonHints: { WEEK: string; MONTH: string; QUARTER: string };
  contentNotAssessed: string;
  brokenBacklinksHeading: string;
  backlinksColumn: string;
  domainsColumn: string;
  reviewKeywordsHeading: string;
  reviewPagesHeading: string;
  moreItems: (count: number) => string;
};
