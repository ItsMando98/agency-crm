import { MAX_CRAWLED_PAGES } from 'src/constants/crawl.const';

export const parseMaxPagesInput = (input: string): string | null => {
  const parsed = Number(input);

  if (input.trim() === '' || !Number.isFinite(parsed) || parsed < 1) {
    return null;
  }

  return String(Math.min(Math.floor(parsed), MAX_CRAWLED_PAGES));
};
