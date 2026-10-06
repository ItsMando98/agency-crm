import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const compareSeoAuditsInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    auditId: { type: 'string', description: 'ID of the newer audit.' },
    previousAuditId: {
      type: 'string',
      description:
        'ID of the audit to compare with. Defaults to the latest finished audit of the same website before this one.',
    },
  },
  required: ['auditId'],
  additionalProperties: false,
};
