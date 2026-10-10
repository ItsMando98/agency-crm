import { SEO_AREA } from 'src/constants/seo-audit.constants';
import { type AreaScores } from 'src/types/area-scores';
import { computeOverallScore } from 'src/utils/compute-overall-score.util';

// Areas whose value depends on a judgement of the classifier.
const JUDGED_AREAS = [SEO_AREA.CONTENT_QUALITY, SEO_AREA.VISIBILITY] as const;

// Null when there is nothing judged to leave out, so no comparison is shown.
export const computeRulesOnlyScore = (areaScores: AreaScores): number | null => {
  const hasJudgedArea = JUDGED_AREAS.some((area) => areaScores[area] !== undefined);

  if (!hasJudgedArea) {
    return null;
  }

  const measuredAreas: AreaScores = Object.fromEntries(
    Object.entries(areaScores).filter(
      ([area]) => !(JUDGED_AREAS as readonly string[]).includes(area),
    ),
  );

  return Object.keys(measuredAreas).length === 0 ? null : computeOverallScore(measuredAreas);
};
