import {
  SCORE_BAND_OKAY_MIN,
  SCORE_BAND_STRONG_MIN,
} from 'src/constants/report.const';
import { type ScoreBand } from 'src/types/score-band';

export const getScoreBand = (score: number): ScoreBand => {
  if (score >= SCORE_BAND_STRONG_MIN) {
    return 'STRONG';
  }

  return score >= SCORE_BAND_OKAY_MIN ? 'OKAY' : 'WEAK';
};
