import type Anthropic from '@anthropic-ai/sdk';

import { SITE_PROFILE_JSON_SCHEMA } from 'src/constants/classifier-schemas.const';
import { SITE_PROFILE_SYSTEM_PROMPT } from 'src/constants/classifier-system-prompts.const';
import { SITE_PROFILE_MAX_TOKENS } from 'src/constants/classifier.const';
import { requestStructuredJson } from 'src/anthropic-client/request-structured-json';
import { type CrawledPage } from 'src/types/crawled-page';
import { type SiteProfile } from 'src/types/site-profile';
import { buildPageClassifierInput } from 'src/utils/build-page-classifier-input.util';
import { parseSiteProfile } from 'src/utils/parse-site-profile.util';

type AssessSiteProfileParams = {
  client: Anthropic;
  homepage: CrawledPage;
  onError?: (message: string) => void;
};

export const assessSiteProfile = async ({
  client,
  homepage,
  onError,
}: AssessSiteProfileParams): Promise<SiteProfile | null> =>
  parseSiteProfile(
    await requestStructuredJson({
      client,
      system: SITE_PROFILE_SYSTEM_PROMPT,
      userContent: buildPageClassifierInput(homepage),
      schema: SITE_PROFILE_JSON_SCHEMA,
      maxTokens: SITE_PROFILE_MAX_TOKENS,
      onError,
    }),
  );
