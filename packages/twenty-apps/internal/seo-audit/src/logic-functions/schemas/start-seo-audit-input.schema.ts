import { type InputJsonSchema } from 'twenty-sdk/logic-function';

import { SEO_AUDIT_LANGUAGE } from 'src/constants/seo-audit.constants';

export const startSeoAuditInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    domain: {
      type: 'string',
      description:
        'Homepage URL or domain of the website to audit, for example example.com or https://www.example.com. Only public websites can be audited. Optional when companyId is given.',
    },
    companyId: {
      type: 'string',
      description:
        'ID of the company record the audit belongs to. The audit then shows up on the company page. When domain is omitted, the domain of the company record is audited.',
    },
    language: {
      type: 'string',
      enum: Object.values(SEO_AUDIT_LANGUAGE),
      description:
        'Report language: DE for German or EN for English. Defaults to the language set in the app settings.',
    },
  },
  additionalProperties: false,
};
