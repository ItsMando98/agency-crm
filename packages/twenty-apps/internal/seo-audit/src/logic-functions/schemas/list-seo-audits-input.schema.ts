import { type InputJsonSchema } from 'twenty-sdk/logic-function';

import { MAX_LIST_LIMIT } from 'src/constants/agent-tool.const';
import { SEO_AUDIT_STATUS } from 'src/constants/seo-audit.constants';

export const listSeoAuditsInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    companyId: {
      type: 'string',
      description: 'Only audits of this company record.',
    },
    domain: {
      type: 'string',
      description: 'Only audits of this website, for example example.com. Matches with or without www.',
    },
    status: {
      type: 'string',
      enum: Object.values(SEO_AUDIT_STATUS),
      description: 'Only audits with this status.',
    },
    limit: {
      type: 'integer',
      description: `How many audits to return, newest first. Defaults to 10, at most ${MAX_LIST_LIMIT}.`,
    },
  },
  additionalProperties: false,
};
