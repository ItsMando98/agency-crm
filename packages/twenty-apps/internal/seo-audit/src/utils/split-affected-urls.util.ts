export const splitAffectedUrls = (affectedUrls: string | null | undefined): string[] =>
  (affectedUrls ?? '')
    .split('\n')
    .map((url) => url.trim())
    .filter((url) => url !== '');
