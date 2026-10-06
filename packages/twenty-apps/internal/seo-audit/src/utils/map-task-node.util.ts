import { asRecord } from 'src/utils/as-record.util';
import { splitAffectedUrls } from 'src/utils/split-affected-urls.util';
import { type SeoEffort } from 'src/types/seo-effort';
import { type SeoPriority } from 'src/types/seo-priority';

export type SeoTaskView = {
  id: string;
  ruleId: string | null;
  name: string;
  description: string | null;
  priority: SeoPriority;
  effort: SeoEffort;
  area: string | null;
  source: string | null;
  status: string | null;
  affectedUrls: string[];
};

const asStringOrNull = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null;

export const mapTaskNode = (node: unknown): SeoTaskView | null => {
  const record = asRecord(node);

  if (record === null || typeof record.id !== 'string') {
    return null;
  }

  return {
    id: record.id,
    ruleId: asStringOrNull(record.ruleId),
    name: asStringOrNull(record.name) ?? '',
    description: asStringOrNull(record.description),
    priority: (asStringOrNull(record.priority) ?? 'MEDIUM') as SeoPriority,
    effort: (asStringOrNull(record.effort) ?? 'MEDIUM') as SeoEffort,
    area: asStringOrNull(record.area),
    source: asStringOrNull(record.source),
    status: asStringOrNull(record.status),
    affectedUrls: splitAffectedUrls(typeof record.affectedUrls === 'string' ? record.affectedUrls : null),
  };
};
