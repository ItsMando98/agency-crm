import {
  AI_MIN_BRAND_NAME_LENGTH,
  AI_QUERY_COUNT,
  AI_QUERY_MAX_LENGTH,
  AI_QUERY_MIN_LENGTH,
} from 'src/constants/ai-visibility.const';
import { asRecord } from 'src/utils/as-record.util';

type ParseAiQueriesParams = {
  ownDomain: string;
  brandNames: string[];
};

// Questions that name the company would ask for it directly and prove nothing.
export const parseAiQueries = (
  value: unknown,
  { ownDomain, brandNames }: ParseAiQueriesParams,
): string[] => {
  const queries = asRecord(value)?.queries;

  if (!Array.isArray(queries)) {
    return [];
  }

  const forbiddenNames = [
    ownDomain,
    ...brandNames.filter((name) => name.length >= AI_MIN_BRAND_NAME_LENGTH),
  ].map((name) => name.toLowerCase());
  const seen = new Set<string>();
  const accepted: string[] = [];

  for (const entry of queries) {
    if (typeof entry !== 'string') {
      continue;
    }

    const query = entry.trim();
    const normalized = query.toLowerCase();

    if (
      query.length < AI_QUERY_MIN_LENGTH ||
      query.length > AI_QUERY_MAX_LENGTH ||
      seen.has(normalized) ||
      forbiddenNames.some((name) => normalized.includes(name))
    ) {
      continue;
    }

    seen.add(normalized);
    accepted.push(query);
  }

  return accepted.slice(0, AI_QUERY_COUNT);
};
