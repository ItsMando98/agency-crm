import { FINDING_CATALOG } from 'src/constants/finding-catalog.const';
import {
  MIN_PENALTY_SHARE,
  SEVERITY_PENALTY,
} from 'src/constants/score-weights.const';
import { type Finding } from 'src/types/finding';

export const computeFindingPenalty = (
  finding: Finding,
  pageCount: number,
): number => {
  const basePenalty = SEVERITY_PENALTY[FINDING_CATALOG[finding.ruleId].severity];
  const affectedShare =
    finding.affectedUrls.length === 0
      ? 1
      : Math.min(1, finding.affectedUrls.length / Math.max(pageCount, 1));

  return basePenalty * (MIN_PENALTY_SHARE + (1 - MIN_PENALTY_SHARE) * affectedShare);
};
