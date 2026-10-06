import { defineSkill } from 'twenty-sdk/define';

import { SEO_AUDIT_SKILL_CONTENT } from 'src/constants/seo-audit-skill-content.const';

export const SEO_AUDIT_SKILL_UNIVERSAL_IDENTIFIER = '09023351-af30-43a7-a225-507dab829898';

export default defineSkill({
  universalIdentifier: SEO_AUDIT_SKILL_UNIVERSAL_IDENTIFIER,
  name: 'seo-audit',
  label: 'SEO audit',
  description:
    'Runs SEO audits for websites, interprets the results, works through the action list and compares audits over time.',
  icon: 'IconSearch',
  content: SEO_AUDIT_SKILL_CONTENT,
});
