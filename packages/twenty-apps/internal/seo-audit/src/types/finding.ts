import { type FindingRuleId } from 'src/types/finding-rule-id';

export type Finding = {
  ruleId: FindingRuleId;
  // Empty means the finding concerns the whole site rather than single pages.
  affectedUrls: string[];
};
