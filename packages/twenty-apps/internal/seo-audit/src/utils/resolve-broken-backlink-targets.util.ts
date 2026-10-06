import { CRAWL_CONCURRENCY } from 'src/constants/crawl.const';
import { type BacklinkTarget } from 'src/types/backlink-target';
import { type CrawlResult } from 'src/types/crawl-result';
import { fetchPage } from 'src/utils/fetch-page.util';
import { isBrokenStatusCode } from 'src/utils/is-broken-status-code.util';
import { resolveInternalLink } from 'src/utils/resolve-internal-link.util';
import { runWithConcurrency } from 'src/utils/run-with-concurrency.util';

type ResolveBrokenBacklinkTargetsParams = {
  targets: BacklinkTarget[];
  crawlResult: Pick<CrawlResult, 'origin' | 'linkTargetStatusCodes'>;
  fetchImplementation?: typeof fetch;
};

// Backlink targets that answer with a dead status. Statuses already known from
// the crawl are reused, the rest is checked with a HEAD request.
export const resolveBrokenBacklinkTargets = async ({
  targets,
  crawlResult,
  fetchImplementation,
}: ResolveBrokenBacklinkTargetsParams): Promise<BacklinkTarget[]> => {
  const checkedTargets = await runWithConcurrency(
    targets,
    CRAWL_CONCURRENCY,
    async (target) => {
      const url = resolveInternalLink(target.url, crawlResult.origin, crawlResult.origin);

      if (url === null) {
        return null;
      }

      const knownStatusCode = crawlResult.linkTargetStatusCodes[url];

      if (knownStatusCode !== undefined) {
        return isBrokenStatusCode(knownStatusCode) ? { ...target, url } : null;
      }

      const headResponse = await fetchPage({ url, method: 'HEAD', fetchImplementation });
      const statusCode =
        headResponse.statusCode === 405 || headResponse.statusCode === 501
          ? (await fetchPage({ url, fetchImplementation })).statusCode
          : headResponse.statusCode;

      return isBrokenStatusCode(statusCode) ? { ...target, url } : null;
    },
  );

  return checkedTargets.filter((target): target is BacklinkTarget => target !== null);
};
