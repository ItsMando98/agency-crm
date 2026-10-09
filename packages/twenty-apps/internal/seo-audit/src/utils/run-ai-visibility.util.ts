import type Anthropic from '@anthropic-ai/sdk';

import { generateAiQueries } from 'src/anthropic-client/generate-ai-queries';
import { AI_ENGINES, AI_MIN_QUERIES } from 'src/constants/ai-visibility.const';
import { collectAiVisibility } from 'src/dataforseo-client/collect-ai-visibility';
import { type AiVisibility } from 'src/types/ai-visibility';
import { type CrawledPage } from 'src/types/crawled-page';
import { type DataForSeoCredentials } from 'src/types/data-for-seo-credentials';
import { type Market } from 'src/types/market';
import { type SiteProfile } from 'src/types/site-profile';
import { deriveBrandNames } from 'src/utils/derive-brand-names.util';
import { getSourceHost } from 'src/utils/get-source-host.util';

type RunAiVisibilityParams = {
  isEnabled: boolean;
  anthropicClient: Anthropic | null;
  credentials: DataForSeoCredentials | null;
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

// Returns null only when the feature is off. Every other outcome is a result
// with notes, so a missing key or a failing engine never fails the audit.
export const runAiVisibility = async ({
  isEnabled,
  anthropicClient,
  credentials,
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

  if (anthropicClient === null || credentials === null) {
    return buildSkippedVisibility(
      now,
      'AI visibility needs DataForSEO and an Anthropic key. It was skipped.',
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
    credentials,
    queries,
    ownDomain,
    brandNames,
    now,
    fetchImplementation,
  });
};
