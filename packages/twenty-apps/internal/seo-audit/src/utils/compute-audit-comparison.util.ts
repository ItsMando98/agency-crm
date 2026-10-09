import { type AuditComparison } from 'src/types/audit-comparison';
import { type ComparableAudit } from 'src/types/comparable-audit';

// Rounding keeps floating point noise such as 0.07 - 0.1 = -0.030000000000000006 out of the result.
const DELTA_PRECISION = 1_000_000;

const compareValues = (previous: number | null, current: number | null) => ({
  previous,
  current,
  delta:
    previous === null || current === null
      ? null
      : Math.round((current - previous) * DELTA_PRECISION) / DELTA_PRECISION,
});

const toTaskByRuleId = (tasks: ComparableAudit['tasks']) =>
  new Map(
    tasks
      .filter((task): task is typeof task & { ruleId: string } => task.ruleId !== null)
      .map((task) => [task.ruleId, task]),
  );

export const computeAuditComparison = (
  previous: ComparableAudit,
  current: ComparableAudit,
): AuditComparison => {
  const previousTasks = toTaskByRuleId(previous.tasks);
  const currentTasks = toTaskByRuleId(current.tasks);
  const areas = new Set([
    ...Object.keys(previous.areaScores ?? {}),
    ...Object.keys(current.areaScores ?? {}),
  ]);

  const previousAreas = new Set(Object.keys(previous.areaScores ?? {}));
  const currentAreas = new Set(Object.keys(current.areaScores ?? {}));
  const areasOnlyInOneAudit = [...areas].filter(
    (area) => previousAreas.has(area) !== currentAreas.has(area),
  );

  return {
    score: compareValues(previous.score, current.score),
    grade: { previous: previous.grade, current: current.grade },
    areaScores: Object.fromEntries(
      [...areas].map((area) => [
        area,
        compareValues(previous.areaScores?.[area] ?? null, current.areaScores?.[area] ?? null),
      ]),
    ),
    market: {
      organicKeywordCount: compareValues(previous.organicKeywordCount, current.organicKeywordCount),
      estimatedMonthlyTraffic: compareValues(previous.estimatedMonthlyTraffic, current.estimatedMonthlyTraffic),
      backlinkCount: compareValues(previous.backlinkCount, current.backlinkCount),
      referringDomainCount: compareValues(previous.referringDomainCount, current.referringDomainCount),
    },
    mobileSpeed: {
      performanceScore: compareValues(previous.mobilePerformanceScore, current.mobilePerformanceScore),
      largestContentfulPaintMs: compareValues(previous.mobileLcpMs, current.mobileLcpMs),
      cumulativeLayoutShift: compareValues(previous.mobileCls, current.mobileCls),
      totalBlockingTimeMs: compareValues(previous.mobileTbtMs, current.mobileTbtMs),
    },
    aiPresenceRate: compareValues(previous.aiPresenceRate, current.aiPresenceRate),
    areasOnlyInOneAudit,
    scoreNote:
      areasOnlyInOneAudit.length === 0
        ? null
        : `The overall score of the two audits covers different areas (${areasOnlyInOneAudit.join(', ')}), so its change is only a rough indication. Compare the area scores instead.`,
    resolvedTasks: [...previousTasks.entries()]
      .filter(([ruleId]) => !currentTasks.has(ruleId))
      .map(([ruleId, task]) => ({ ruleId, name: task.name, priority: task.priority })),
    newTasks: [...currentTasks.entries()]
      .filter(([ruleId]) => !previousTasks.has(ruleId))
      .map(([ruleId, task]) => ({ ruleId, name: task.name, priority: task.priority })),
    persistingTaskCount: [...currentTasks.keys()].filter((ruleId) => previousTasks.has(ruleId)).length,
  };
};
