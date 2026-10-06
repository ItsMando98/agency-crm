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
  resolvedTasks: ComparedTask[];
  newTasks: ComparedTask[];
  persistingTaskCount: number;
};
