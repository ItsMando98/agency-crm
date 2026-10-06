import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const getSeoAuditInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    auditId: {
      type: 'string',
      description: 'ID of the SEO audit record returned by start_seo_audit.',
    },
  },
  required: ['auditId'],
  additionalProperties: false,
};
