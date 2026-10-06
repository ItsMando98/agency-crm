import { type AuditComparison } from 'src/types/audit-comparison';
import { type ComparableAudit } from 'src/types/comparable-audit';

const compareValues = (previous: number | null, current: number | null) => ({
  previous,
  current,
  delta: previous === null || current === null ? null : current - previous,
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
    resolvedTasks: [...previousTasks.entries()]
      .filter(([ruleId]) => !currentTasks.has(ruleId))
      .map(([ruleId, task]) => ({ ruleId, name: task.name, priority: task.priority })),
    newTasks: [...currentTasks.entries()]
      .filter(([ruleId]) => !previousTasks.has(ruleId))
      .map(([ruleId, task]) => ({ ruleId, name: task.name, priority: task.priority })),
    persistingTaskCount: [...currentTasks.keys()].filter((ruleId) => previousTasks.has(ruleId)).length,
  };
};
