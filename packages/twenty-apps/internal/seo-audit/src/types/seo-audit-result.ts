import { type AiReadiness } from 'src/types/ai-readiness';
import { type AiVisibility } from 'src/types/ai-visibility';
import { type AreaScores } from 'src/types/area-scores';
import { type AuditLanguage } from 'src/types/audit-language';
import { type AuditTask } from 'src/types/audit-task';
import { type BacklinkTarget } from 'src/types/backlink-target';
import { type CrawledPage } from 'src/types/crawled-page';
import { type MarketData } from 'src/types/market-data';
import { type PageAssessment } from 'src/types/page-assessment';
import { type ScoredKeyword } from 'src/types/scored-keyword';

export type SeoAuditResult = {
  origin: string;
  language: AuditLanguage;
  // ISO timestamp of when the audit finished.
  generatedAt: string;
  brokenBacklinkTargets: BacklinkTarget[];
  aiReadiness: AiReadiness;
  // Null when the paid AI visibility check is switched off.
  aiVisibility: AiVisibility | null;
  // Why a part of the audit is missing or incomplete, for example failed classifier requests.
  notes: string[];
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
