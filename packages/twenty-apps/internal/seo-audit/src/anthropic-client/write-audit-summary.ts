import type Anthropic from '@anthropic-ai/sdk';

import { requestStructuredJson } from 'src/anthropic-client/request-structured-json';
import {
  AUDIT_SUMMARY_JSON_SCHEMA,
  AUDIT_SUMMARY_MAX_TOKENS,
  AUDIT_SUMMARY_SYSTEM_PROMPT,
} from 'src/constants/audit-summary.const';
import { SUMMARY_MODEL } from 'src/constants/classifier.const';
import { type AuditSummary } from 'src/types/audit-insights';
import { type AuditLanguage } from 'src/types/audit-language';
import { parseAuditSummary } from 'src/utils/parse-audit-summary.util';
import { collectFactNumbers } from 'src/utils/verify-summary-numbers.util';

type WriteAuditSummaryParams = {
  client: Anthropic;
  facts: Record<string, unknown>;
  language: AuditLanguage;
  onError?: (message: string) => void;
};

const LANGUAGE_NAME = { DE: 'German', EN: 'English' } as const;

// One request to the strong model. The answer is checked number by number
// against the facts it was given, so an invented figure is marked, not trusted.
export const writeAuditSummary = async ({
  client,
  facts,
  language,
  onError,
}: WriteAuditSummaryParams): Promise<AuditSummary | null> =>
  parseAuditSummary({
    raw: await requestStructuredJson({
      client,
      model: SUMMARY_MODEL,
      system: AUDIT_SUMMARY_SYSTEM_PROMPT,
      userContent: [
        `Write the summary in ${LANGUAGE_NAME[language]}.`,
        '',
        'Facts of the audit:',
        '<facts>',
        JSON.stringify(facts, null, 2),
        '</facts>',
      ].join('\n'),
      schema: AUDIT_SUMMARY_JSON_SCHEMA,
      maxTokens: AUDIT_SUMMARY_MAX_TOKENS,
      onError,
    }),
    model: SUMMARY_MODEL,
    factNumbers: collectFactNumbers(facts),
  });
