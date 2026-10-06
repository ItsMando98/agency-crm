import { type FindingRuleId } from 'src/types/finding-rule-id';

export type Finding = {
  ruleId: FindingRuleId;
  // Empty means the finding concerns the whole site rather than single pages.
  affectedUrls: string[];
  // The number shown in the title when it differs from the affected URL count.
  count?: number;
  // Concrete examples shown under the task, for example the best keywords.
  details?: string[];
};
