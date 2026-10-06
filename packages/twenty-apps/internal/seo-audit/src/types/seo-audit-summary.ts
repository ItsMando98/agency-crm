export type SeoAuditSummary = {
  id: string;
  name: string | null;
  domain: string | null;
  status: string | null;
  score: number | null;
  grade: string | null;
  areaScores: Record<string, number> | null;
  pagesCrawled: number | null;
  reportUrl: string | null;
  companyId: string | null;
  createdAt: string | null;
  finishedAt: string | null;
};
