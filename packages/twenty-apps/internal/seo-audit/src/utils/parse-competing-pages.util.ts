import { COMPETING_PAGES_MAX_GROUPS } from 'src/constants/competing-pages.const';
import { type CompetingPageGroup } from 'src/types/audit-insights';
import { asRecord } from 'src/utils/as-record.util';

const MAX_TOPIC_LENGTH = 80;

// Keeps only real groups: two distinct known pages, and a page appears in one group only.
export const parseCompetingPages = (
  raw: unknown,
  urls: string[],
): CompetingPageGroup[] => {
  const groups = asRecord(raw)?.groups;

  if (!Array.isArray(groups)) {
    return [];
  }

  const usedUrls = new Set<string>();
  const result: CompetingPageGroup[] = [];

  for (const group of groups) {
    const record = asRecord(group);
    const topic = typeof record?.topic === 'string' ? record.topic.trim() : '';
    const indexes = Array.isArray(record?.pages) ? record.pages : [];
    const groupUrls = [
      ...new Set(
        indexes
          .filter((index): index is number => Number.isInteger(index))
          .map((index) => urls[index])
          .filter((url): url is string => url !== undefined && !usedUrls.has(url)),
      ),
    ];

    if (topic === '' || groupUrls.length < 2) {
      continue;
    }

    groupUrls.forEach((url) => usedUrls.add(url));
    result.push({ topic: topic.slice(0, MAX_TOPIC_LENGTH), urls: groupUrls });

    if (result.length >= COMPETING_PAGES_MAX_GROUPS) {
      break;
    }
  }

  return result;
};
