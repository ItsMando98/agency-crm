import { type InputJsonSchema } from 'twenty-sdk/logic-function';

import { SEO_AUDIT_LANGUAGE } from 'src/constants/seo-audit.constants';

export const startSeoAuditInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    domain: {
      type: 'string',
      description:
        'Homepage URL or domain of the website to audit, for example example.com or https://www.example.com. Only public websites can be audited.',
    },
    companyId: {
      type: 'string',
      description:
        'Optional ID of the company record this audit belongs to. Use it so the audit shows up on the company page.',
    },
    language: {
      type: 'string',
      enum: Object.values(SEO_AUDIT_LANGUAGE),
      description:
        'Report language: DE for German (default) or EN for English.',
    },
  },
  required: ['domain'],
  additionalProperties: false,
};
