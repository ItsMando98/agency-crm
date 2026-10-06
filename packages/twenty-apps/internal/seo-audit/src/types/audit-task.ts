import { type FindingRuleId } from 'src/types/finding-rule-id';
import { type SeoArea } from 'src/types/seo-area';
import { type SeoEffort } from 'src/types/seo-effort';
import { type SeoPriority } from 'src/types/seo-priority';
import { type SeoTaskSource } from 'src/types/seo-task-source';

export type AuditTask = {
  ruleId: FindingRuleId;
  name: string;
  description: string;
  priority: SeoPriority;
  effort: SeoEffort;
  area: SeoArea;
  source: SeoTaskSource;
  affectedUrls: string[];
};
