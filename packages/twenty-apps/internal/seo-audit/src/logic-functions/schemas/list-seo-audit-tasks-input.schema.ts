import { type InputJsonSchema } from 'twenty-sdk/logic-function';

import { MAX_TASK_LIMIT } from 'src/constants/agent-tool.const';
import {
  SEO_AREA,
  SEO_AUDIT_TASK_STATUS,
  SEO_PRIORITY,
} from 'src/constants/seo-audit.constants';

export const listSeoAuditTasksInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    auditId: { type: 'string', description: 'ID of the SEO audit.' },
    status: {
      type: 'string',
      enum: Object.values(SEO_AUDIT_TASK_STATUS),
      description: 'Only tasks with this status. Use OPEN to see what is left to do.',
    },
    priority: {
      type: 'string',
      enum: Object.values(SEO_PRIORITY),
      description: 'Only tasks with this priority.',
    },
    area: {
      type: 'string',
      enum: Object.values(SEO_AREA),
      description: 'Only tasks of this area, for example ON_PAGE, VISIBILITY or AI_VISIBILITY.',
    },
    limit: {
      type: 'integer',
      description: `How many tasks to return. Defaults to 20, at most ${MAX_TASK_LIMIT}.`,
    },
  },
  required: ['auditId'],
  additionalProperties: false,
};
