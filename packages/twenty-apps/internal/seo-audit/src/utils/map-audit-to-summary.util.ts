import { type SeoAuditSummary } from 'src/types/seo-audit-summary';
import { asFiniteNumber } from 'src/utils/as-finite-number.util';
import { asRecord } from 'src/utils/as-record.util';

const asStringOrNull = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null;

const parseAreaScores = (value: unknown): Record<string, number> | null => {
  const record = asRecord(value);

  if (record === null) {
    return null;
  }

  const entries = Object.entries(record).filter(
    (entry): entry is [string, number] => asFiniteNumber(entry[1]) !== null,
  );

  return entries.length > 0 ? Object.fromEntries(entries) : null;
};

export const mapAuditToSummary = (node: Record<string, unknown>): SeoAuditSummary => ({
  id: String(node.id),
  name: asStringOrNull(node.name),
  domain: asStringOrNull(node.domain),
  status: asStringOrNull(node.status),
  score: asFiniteNumber(node.score),
  grade: asStringOrNull(node.grade),
  areaScores: parseAreaScores(node.areaScores),
  pagesCrawled: asFiniteNumber(node.pagesCrawled),
  reportUrl: asStringOrNull(node.reportUrl),
  companyId: asStringOrNull(node.companyId),
  createdAt: asStringOrNull(node.createdAt),
  finishedAt: asStringOrNull(node.finishedAt),
});
