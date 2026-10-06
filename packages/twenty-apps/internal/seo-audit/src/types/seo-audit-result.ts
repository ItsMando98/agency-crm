import { type AreaScores } from 'src/types/area-scores';
import { type AuditTask } from 'src/types/audit-task';
import { type CrawledPage } from 'src/types/crawled-page';
import { type PageAssessment } from 'src/types/page-assessment';

export type SeoAuditResult = {
  score: number;
  grade: string;
  areaScores: AreaScores;
  pages: CrawledPage[];
  assessments: PageAssessment[];
  tasks: AuditTask[];
  reportMarkdown: string;
};
