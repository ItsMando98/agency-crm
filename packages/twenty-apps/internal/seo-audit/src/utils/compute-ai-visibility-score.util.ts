import { AI_SCORE_PRESENCE_SHARE } from 'src/constants/ai-visibility.const';
import { type AiReadiness } from 'src/types/ai-readiness';
import { type AiVisibility } from 'src/types/ai-visibility';
import { computeAiReadinessScore } from 'src/utils/compute-ai-readiness-score.util';

type ComputeAiVisibilityScoreParams = {
  aiReadiness: AiReadiness;
  aiVisibility: AiVisibility | null;
};

const PERCENT = 100;

export const computeAiVisibilityScore = ({
  aiReadiness,
  aiVisibility,
}: ComputeAiVisibilityScoreParams): number => {
  const readinessScore = computeAiReadinessScore(aiReadiness);

  if (aiVisibility === null || aiVisibility.presenceRate === null) {
    return readinessScore;
  }

  return Math.round(
    AI_SCORE_PRESENCE_SHARE * aiVisibility.presenceRate * PERCENT +
      (1 - AI_SCORE_PRESENCE_SHARE) * readinessScore,
  );
};
