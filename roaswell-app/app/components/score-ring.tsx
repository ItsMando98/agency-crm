import { getScoreTone } from '~/lib/labels';

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const TONE_COLOR = {
  success: 'stroke-success',
  warning: 'stroke-warning',
  danger: 'stroke-danger',
} as const;

type ScoreRingProps = { score: number | null; grade: string | null };

export const ScoreRing = ({ score, grade }: ScoreRingProps) => {
  const value = score ?? 0;
  const tone = getScoreTone(value);

  return (
    <div
      className="relative h-36 w-36"
      role="img"
      aria-label={score === null ? 'Kein Score' : `Score ${score} von 100, Note ${grade ?? '-'}`}
    >
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="9" className="stroke-muted" />
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          className={TONE_COLOR[tone]}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - value / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tabular-nums">{score ?? '-'}</span>
        <span className="text-xs text-muted-foreground">Note {grade ?? '-'}</span>
      </div>
    </div>
  );
};
