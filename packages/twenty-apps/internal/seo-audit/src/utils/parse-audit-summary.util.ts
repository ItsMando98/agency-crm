import {
  SUMMARY_MAX_ITEM_LENGTH,
  SUMMARY_MAX_ITEMS_PER_SECTION,
} from 'src/constants/audit-summary.const';
import { type AuditSummary, type SummaryItem } from 'src/types/audit-insights';
import { asRecord } from 'src/utils/as-record.util';
import { findUnverifiedNumbers } from 'src/utils/verify-summary-numbers.util';

type ParseAuditSummaryParams = {
  raw: unknown;
  model: string;
  factNumbers: Set<number>;
};

const toItems = (value: unknown, factNumbers: Set<number>): SummaryItem[] =>
  (Array.isArray(value) ? value : [])
    .filter((entry): entry is string => typeof entry === 'string' && entry.trim() !== '')
    .slice(0, SUMMARY_MAX_ITEMS_PER_SECTION)
    .map((entry) => {
      const text = entry.trim().slice(0, SUMMARY_MAX_ITEM_LENGTH);

      return { text, unverifiedNumbers: findUnverifiedNumbers(text, factNumbers) };
    });

// Null when the answer has no headline, so the report keeps its code summary.
export const parseAuditSummary = ({
  raw,
  model,
  factNumbers,
}: ParseAuditSummaryParams): AuditSummary | null => {
  const record = asRecord(raw);
  const headlineText =
    typeof record?.headline === 'string' ? record.headline.trim().slice(0, SUMMARY_MAX_ITEM_LENGTH) : '';

  if (record === null || headlineText === '') {
    return null;
  }

  const headline: SummaryItem = {
    text: headlineText,
    unverifiedNumbers: findUnverifiedNumbers(headlineText, factNumbers),
  };
  const strengths = toItems(record.strengths, factNumbers);
  const blockers = toItems(record.blockers, factNumbers);
  const thisWeek = toItems(record.thisWeek, factNumbers);
  const thisMonth = toItems(record.thisMonth, factNumbers);
  const thisQuarter = toItems(record.thisQuarter, factNumbers);
  const allItems = [headline, ...strengths, ...blockers, ...thisWeek, ...thisMonth, ...thisQuarter];

  return {
    model,
    headline,
    strengths,
    blockers,
    thisWeek,
    thisMonth,
    thisQuarter,
    isFullyVerified: allItems.every((item) => item.unverifiedNumbers.length === 0),
  };
};
