// Stored domains are origins like https://www.example.com, so a search for
// example.com has to match any scheme and with or without www.
export const buildDomainFilterPattern = (domain: string): string => {
  const hostname = domain
    .trim()
    .toLowerCase()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//, '')
    .replace(/^www\./, '')
    .split(/[/?#]/)[0];

  return `%${hostname}%`;
};
