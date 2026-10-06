export const clampLimit = (
  requested: number | undefined,
  defaultLimit: number,
  maxLimit: number,
): number =>
  requested === undefined || !Number.isFinite(requested)
    ? defaultLimit
    : Math.max(1, Math.min(Math.floor(requested), maxLimit));
