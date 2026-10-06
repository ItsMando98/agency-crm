import { type InputJsonSchema } from 'twenty-sdk/logic-function';

import { MAX_TASK_UPDATES_PER_CALL } from 'src/constants/agent-tool.const';
import { SEO_AUDIT_TASK_STATUS } from 'src/constants/seo-audit.constants';

export const updateSeoAuditTasksInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    tasks: {
      type: 'array',
      description: `Tasks to update, at most ${MAX_TASK_UPDATES_PER_CALL} per call.`,
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID of the task from list_seo_audit_tasks.' },
          status: {
            type: 'string',
            enum: Object.values(SEO_AUDIT_TASK_STATUS),
            description:
              'New status: OPEN, IN_PROGRESS, DONE or WONT_FIX. Only set DONE once the fix is live.',
          },
        },
        required: ['id', 'status'],
        additionalProperties: false,
      },
    },
  },
  required: ['tasks'],
  additionalProperties: false,
};
