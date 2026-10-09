import type Anthropic from '@anthropic-ai/sdk';

import { generateAiQueries } from 'src/anthropic-client/generate-ai-queries';
import {
  AI_DEADLINE_MS,
  AI_ENGINES,
  AI_MIN_QUERIES,
  AI_REQUEST_CONCURRENCY,
  TREG_DEADLINE_MS,
  TREG_REQUEST_CONCURRENCY,
} from 'src/constants/ai-visibility.const';
import { MARKETS } from 'src/constants/dataforseo.const';
import {
  collectAiVisibility,
  type FetchAiAnswer,
} from 'src/dataforseo-client/collect-ai-visibility';
import { fetchAiAnswer } from 'src/dataforseo-client/fetch-ai-answer';
import { fetchTregAnswer } from 'src/treg-client/fetch-treg-answer';
import { type AiVisibility } from 'src/types/ai-visibility';
import { type CrawledPage } from 'src/types/crawled-page';
import { type DataForSeoCredentials } from 'src/types/data-for-seo-credentials';
import { type Market } from 'src/types/market';
import { type SiteProfile } from 'src/types/site-profile';
import { type TregCredentials } from 'src/types/treg-credentials';
import { deriveBrandNames } from 'src/utils/derive-brand-names.util';
import { getSourceHost } from 'src/utils/get-source-host.util';

type RunAiVisibilityParams = {
  isEnabled: boolean;
  anthropicClient: Anthropic | null;
  credentials: DataForSeoCredentials | null;
  // Preferred over DataForSEO: it answers through the consumer apps and costs less.
  tregCredentials?: TregCredentials | null;
  origin: string;
  homepage: CrawledPage;
  auditablePages: CrawledPage[];
  siteProfile: SiteProfile | null;
  market: Market;
  now: Date;
  fetchImplementation?: typeof fetch;
};

const MAX_PAGE_TITLES_IN_CONTEXT = 20;

const buildSkippedVisibility = (now: Date, note: string): AiVisibility => ({
  rows: [],
  engines: AI_ENGINES.map(({ id }) => id),
  presenceRate: null,
  queriesTested: 0,
  testedAt: now.toISOString(),
  costUsd: 0,
  notes: [note],
});

type AnswerSource = {
  fetchAnswer: FetchAiAnswer;
  concurrency: number;
  deadlineMs: number;
};

const buildAnswerSource = ({
  tregCredentials,
  credentials,
  market,
  fetchImplementation,
}: {
  tregCredentials: TregCredentials | null;
  credentials: DataForSeoCredentials | null;
  market: Market;
  fetchImplementation?: typeof fetch;
}): AnswerSource | null => {
  if (tregCredentials !== null) {
    return {
      fetchAnswer: ({ engine, query }) =>
        fetchTregAnswer({
          credentials: tregCredentials,
          engine,
          query,
          countryCode: MARKETS[market].countryCode,
          fetchImplementation,
        }),
      concurrency: TREG_REQUEST_CONCURRENCY,
      deadlineMs: TREG_DEADLINE_MS,
    };
  }

  if (credentials !== null) {
    return {
      fetchAnswer: ({ engine, query }) =>
        fetchAiAnswer({ credentials, engine, query, fetchImplementation }),
      concurrency: AI_REQUEST_CONCURRENCY,
      deadlineMs: AI_DEADLINE_MS,
    };
  }

  return null;
};

// Returns null only when the feature is off. Every other outcome is a result
// with notes, so a missing key or a failing engine never fails the audit.
export const runAiVisibility = async ({
  isEnabled,
  anthropicClient,
  credentials,
  tregCredentials = null,
  origin,
  homepage,
  auditablePages,
  siteProfile,
  market,
  now,
  fetchImplementation,
}: RunAiVisibilityParams): Promise<AiVisibility | null> => {
  if (!isEnabled) {
    return null;
  }

  const answerSource = buildAnswerSource({
    tregCredentials,
    credentials,
    market,
    fetchImplementation,
  });

  if (anthropicClient === null || answerSource === null) {
    return buildSkippedVisibility(
      now,
      'AI visibility needs treg or DataForSEO, and an Anthropic key. It was skipped.',
    );
  }

  const ownDomain = getSourceHost(origin) ?? origin;
  const brandNames = deriveBrandNames(origin);
  const queries = await generateAiQueries({
    client: anthropicClient,
    context: {
      title: homepage.title,
      metaDescription: homepage.metaDescription,
      businessModel: siteProfile?.businessModel ?? null,
      servesLocalArea: siteProfile?.servesLocalArea ?? null,
      pageTitles: auditablePages
        .map((page) => page.title)
        .filter((title): title is string => title !== null)
        .slice(0, MAX_PAGE_TITLES_IN_CONTEXT),
    },
    market,
    ownDomain,
    brandNames,
  });

  if (queries.length < AI_MIN_QUERIES) {
    return buildSkippedVisibility(
      now,
      'Too few usable customer questions were generated. AI visibility was skipped.',
    );
  }

  return collectAiVisibility({
    ...answerSource,
    queries,
    ownDomain,
    brandNames,
    now,
  });
};
