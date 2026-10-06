import { type InputJsonSchema } from 'twenty-sdk/logic-function';

import { MAX_KEYWORD_LIMIT } from 'src/constants/agent-tool.const';
import { KEYWORD_CATEGORY } from 'src/constants/seo-audit.constants';

export const listSeoKeywordsInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    auditId: { type: 'string', description: 'ID of the SEO audit.' },
    category: {
      type: 'string',
      enum: Object.values(KEYWORD_CATEGORY),
      description:
        'QUICK_WIN is positions 4 to 10, NEAR_PAGE_ONE is positions 11 to 30, TOP_3 already ranks well, LOW_RANKING is beyond 30, NOT_RELEVANT was judged not to bring customers, NEEDS_REVIEW is unsure and needs a human look.',
    },
    minSearchVolume: {
      type: 'integer',
      description: 'Only keywords with at least this many searches per month.',
    },
    limit: {
      type: 'integer',
      description: `How many keywords to return, highest search volume first. Defaults to 25, at most ${MAX_KEYWORD_LIMIT}.`,
    },
  },
  required: ['auditId'],
  additionalProperties: false,
};
