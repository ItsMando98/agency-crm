import type Anthropic from '@anthropic-ai/sdk';

import { requestStructuredJson } from 'src/anthropic-client/request-structured-json';
import {
  COMPETING_PAGES_JSON_SCHEMA,
  COMPETING_PAGES_MAX_INPUT_PAGES,
  COMPETING_PAGES_MAX_TOKENS,
  COMPETING_PAGES_MIN_PAGES,
  COMPETING_PAGES_SYSTEM_PROMPT,
} from 'src/constants/competing-pages.const';
import { type CompetingPageGroup } from 'src/types/audit-insights';
import {
  buildCompetingPagesInput,
  type CompetingPageCandidate,
} from 'src/utils/build-competing-pages-input.util';
import { parseCompetingPages } from 'src/utils/parse-competing-pages.util';

type FindCompetingPagesParams = {
  client: Anthropic;
  candidates: CompetingPageCandidate[];
  onError?: (message: string) => void;
};

// One request for the whole site: the model sees all pages together, which is
// the only way to notice that two of them answer the same search.
export const findCompetingPages = async ({
  client,
  candidates,
  onError,
}: FindCompetingPagesParams): Promise<CompetingPageGroup[]> => {
  if (candidates.length < COMPETING_PAGES_MIN_PAGES) {
    return [];
  }

  const shown = candidates.slice(0, COMPETING_PAGES_MAX_INPUT_PAGES);

  return parseCompetingPages(
    await requestStructuredJson({
      client,
      system: COMPETING_PAGES_SYSTEM_PROMPT,
      userContent: buildCompetingPagesInput(shown),
      schema: COMPETING_PAGES_JSON_SCHEMA,
      maxTokens: COMPETING_PAGES_MAX_TOKENS,
      onError,
    }),
    shown.map((candidate) => candidate.url),
  );
};
