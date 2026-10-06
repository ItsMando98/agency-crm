import { AREA_WEIGHTS } from 'src/constants/score-weights.const';
import { type AreaScores } from 'src/types/area-scores';
import { type SeoArea } from 'src/types/seo-area';

export const computeOverallScore = (areaScores: AreaScores): number => {
  const entries = Object.entries(areaScores) as [SeoArea, number][];
  const totalWeight = entries.reduce((sum, [area]) => sum + AREA_WEIGHTS[area], 0);

  if (totalWeight === 0) {
    return 0;
  }

  const weightedSum = entries.reduce(
    (sum, [area, score]) => sum + score * AREA_WEIGHTS[area],
    0,
  );

  return Math.round(weightedSum / totalWeight);
};
