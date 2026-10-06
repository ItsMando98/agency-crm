export const formatShowingTime = (
  scheduledAt: string | null | undefined,
  locale?: string,
): string => {
  if (typeof scheduledAt !== 'string') {
    return '';
  }

  const date = new Date(scheduledAt);

  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
};
