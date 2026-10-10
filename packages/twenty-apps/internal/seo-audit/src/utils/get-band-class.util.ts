import { type ScoreBand } from 'src/types/score-band';

const BAND_CLASS: Record<ScoreBand, string> = {
  STRONG: 'c-good',
  OKAY: 'c-mid',
  WEAK: 'c-crit',
};

export const getBandClass = (band: ScoreBand): string => BAND_CLASS[band];
