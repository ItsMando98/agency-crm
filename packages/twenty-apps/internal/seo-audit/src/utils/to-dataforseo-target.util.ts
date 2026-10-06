// DataForSEO expects the bare domain without scheme and without www.
export const toDataForSeoTarget = (origin: string): string =>
  new URL(origin).hostname.replace(/^www\./, '');
