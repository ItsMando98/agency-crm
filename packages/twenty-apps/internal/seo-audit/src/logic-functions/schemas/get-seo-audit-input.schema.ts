import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const getSeoAuditInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    auditId: {
      type: 'string',
      description: 'ID of the SEO audit record returned by start_seo_audit.',
    },
    includeReport: {
      type: 'boolean',
      description:
        'Include the full Markdown report with the prioritized action list. Defaults to true. Set to false when only the scores and tasks are needed.',
    },
  },
  required: ['auditId'],
  additionalProperties: false,
};
