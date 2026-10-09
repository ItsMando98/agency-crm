type ComparedValue = {
  previous: number | null;
  current: number | null;
  delta: number | null;
};

type ComparedTask = {
  ruleId: string;
  name: string;
  priority: string;
};

export type AuditComparison = {
  score: ComparedValue;
  grade: { previous: string | null; current: string | null };
  areaScores: Record<string, ComparedValue>;
  market: {
    organicKeywordCount: ComparedValue;
    estimatedMonthlyTraffic: ComparedValue;
    backlinkCount: ComparedValue;
    referringDomainCount: ComparedValue;
  };
  mobileSpeed: {
    performanceScore: ComparedValue;
    largestContentfulPaintMs: ComparedValue;
    cumulativeLayoutShift: ComparedValue;
    totalBlockingTimeMs: ComparedValue;
  };
  aiPresenceRate: ComparedValue;
  // Areas that only one of the two audits has, so the overall scores are not like for like.
  areasOnlyInOneAudit: string[];
  scoreNote: string | null;
  resolvedTasks: ComparedTask[];
  newTasks: ComparedTask[];
  persistingTaskCount: number;
};
