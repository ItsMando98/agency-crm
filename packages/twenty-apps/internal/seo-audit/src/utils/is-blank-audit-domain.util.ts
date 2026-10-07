export const isBlankAuditDomain = (
  domain: string | null | undefined,
): boolean => (domain ?? '').trim() === '';
