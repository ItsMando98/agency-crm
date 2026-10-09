export type ComparableAudit = {
  score: number | null;
  grade: string | null;
  areaScores: Record<string, number> | null;
  organicKeywordCount: number | null;
  estimatedMonthlyTraffic: number | null;
  backlinkCount: number | null;
  referringDomainCount: number | null;
  mobilePerformanceScore: number | null;
  mobileLcpMs: number | null;
  mobileCls: number | null;
  mobileTbtMs: number | null;
  aiPresenceRate: number | null;
  tasks: { ruleId: string | null; name: string; priority: string }[];
};
