import { type AreaScores } from 'src/types/area-scores';
import { type AuditTask } from 'src/types/audit-task';
import { type CrawledPage } from 'src/types/crawled-page';
import { type MarketData } from 'src/types/market-data';
import { type PageAssessment } from 'src/types/page-assessment';
import { type ScoredKeyword } from 'src/types/scored-keyword';

export type SeoAuditResult = {
  score: number;
  grade: string;
  areaScores: AreaScores;
  pages: CrawledPage[];
  assessments: PageAssessment[];
  tasks: AuditTask[];
  marketData: MarketData | null;
  keywords: ScoredKeyword[];
  reportMarkdown: string;
};
