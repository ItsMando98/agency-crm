import {
  type ShowingDayGroup,
  type ShowingSummary,
} from 'src/front-components/types/showing-summary';

const MILLISECONDS_PER_DAY = 86_400_000;

const getStartOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getDayKey = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
};

const getDayLabel = (date: Date, now: Date, locale?: string): string => {
  const dayOffset = Math.round(
    (getStartOfDay(date).getTime() - getStartOfDay(now).getTime()) /
      MILLISECONDS_PER_DAY,
  );

  if (dayOffset === 0) {
    return 'Today';
  }

  if (dayOffset === 1) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

const getScheduledTime = (showing: ShowingSummary): number =>
  typeof showing.scheduledAt === 'string'
    ? new Date(showing.scheduledAt).getTime()
    : Number.NaN;

export const groupShowingsByDay = (
  showings: ShowingSummary[],
  now: Date,
  locale?: string,
): ShowingDayGroup[] =>
  showings
    .filter((showing) => !Number.isNaN(getScheduledTime(showing)))
    .sort((first, second) => getScheduledTime(first) - getScheduledTime(second))
    .reduce<ShowingDayGroup[]>((groups, showing) => {
      const date = new Date(getScheduledTime(showing));
      const dayKey = getDayKey(date);
      const hasGroup = groups.some((group) => group.dayKey === dayKey);

      return hasGroup
        ? groups.map((group) =>
            group.dayKey === dayKey
              ? { ...group, showings: [...group.showings, showing] }
              : group,
          )
        : [
            ...groups,
            { dayKey, label: getDayLabel(date, now, locale), showings: [showing] },
          ];
    }, []);
