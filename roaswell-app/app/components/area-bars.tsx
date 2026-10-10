import { cn } from '~/lib/cn';
import { getAreaLabel, getScoreTone } from '~/lib/labels';

const BAR_COLOR = { success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger' } as const;

export const AreaBars = ({ areaScores }: { areaScores: Record<string, number> }) => {
  const entries = Object.entries(areaScores).sort((first, second) => first[1] - second[1]);

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">Noch keine Bereichswerte.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {entries.map(([area, score]) => (
        <li key={area} className="grid grid-cols-[9rem_1fr_2.5rem] items-center gap-3 text-sm">
          <span className="truncate">{getAreaLabel(area)}</span>
          <div
            className="h-2 rounded-full bg-muted"
            role="progressbar"
            aria-label={getAreaLabel(area)}
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={cn('h-full rounded-full', BAR_COLOR[getScoreTone(score)])}
              style={{ width: `${Math.max(2, score)}%` }}
            />
          </div>
          <span className="text-right tabular-nums text-muted-foreground">{score}</span>
        </li>
      ))}
    </ul>
  );
};
