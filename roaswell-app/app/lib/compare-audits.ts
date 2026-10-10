import { type AuditSummary } from '~/lib/twenty/audit-types';

export type AuditComparison = {
  scoreDelta: number | null;
  areaDeltas: { area: string; current: number; previous: number; delta: number }[];
  onlyInCurrent: string[];
  onlyInPrevious: string[];
};

type Comparable = Pick<AuditSummary, 'score' | 'areaScores'>;

export const compareAudits = (current: Comparable, previous: Comparable): AuditComparison => {
  const currentAreas = Object.keys(current.areaScores);
  const previousAreas = Object.keys(previous.areaScores);

  return {
    scoreDelta:
      current.score !== null && previous.score !== null ? current.score - previous.score : null,
    areaDeltas: currentAreas
      .filter((area) => area in previous.areaScores)
      .map((area) => {
        const currentScore = current.areaScores[area] ?? 0;
        const previousScore = previous.areaScores[area] ?? 0;

        return { area, current: currentScore, previous: previousScore, delta: currentScore - previousScore };
      })
      .sort((first, second) => first.delta - second.delta),
    onlyInCurrent: currentAreas.filter((area) => !(area in previous.areaScores)),
    onlyInPrevious: previousAreas.filter((area) => !(area in current.areaScores)),
  };
};
