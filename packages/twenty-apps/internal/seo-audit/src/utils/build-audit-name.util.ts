export const buildAuditName = (origin: string, date: Date): string =>
  `${new URL(origin).hostname} ${date.toISOString().slice(0, 10)}`;
