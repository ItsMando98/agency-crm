import { type SeoAuditResult } from 'src/types/seo-audit-result';

// One field shows every reason a part of the audit is missing or was skipped.
export const buildAuditNotes = (
  result: Pick<SeoAuditResult, 'marketData' | 'aiVisibility' | 'notes'>,
): string | null => {
  const notes = [
    ...(result.marketData?.notes ?? []),
    ...result.notes,
    ...(result.aiVisibility?.notes ?? []),
  ];

  return notes.length > 0 ? notes.join('\n') : null;
};
