import { type CrawledPage } from 'src/types/crawled-page';

export const findDuplicateUrls = (
  pages: CrawledPage[],
  getValue: (page: CrawledPage) => string | null,
): string[] => {
  const urlsByValue = new Map<string, string[]>();

  for (const page of pages) {
    const value = getValue(page)?.trim().toLowerCase();

    if (value === undefined || value === '') {
      continue;
    }

    urlsByValue.set(value, [...(urlsByValue.get(value) ?? []), page.url]);
  }

  return [...urlsByValue.values()]
    .filter((urls) => urls.length > 1)
    .flat();
};
