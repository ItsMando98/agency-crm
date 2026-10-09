import {
  AI_CRAWLERS,
  AI_READINESS_HOMEPAGE_PATH,
} from 'src/constants/ai-readiness.const';
import {
  type AiCrawlerAccessStatus,
  type AiCrawlerId,
} from 'src/types/ai-readiness';
import { isPathAllowed } from 'src/utils/is-path-allowed.util';
import {
  parseRobotsGroups,
  selectRobotsGroup,
} from 'src/utils/parse-robots-rules.util';

// Only the homepage counts: a crawler that may read it can read the site, and
// blocking single sections is common and usually intended.
export const evaluateAiCrawlerAccess = (
  robotsTxt: string | null,
): Record<AiCrawlerId, AiCrawlerAccessStatus> => {
  const { groups } = parseRobotsGroups(robotsTxt ?? '');

  return Object.fromEntries(
    AI_CRAWLERS.map(({ id, robotsToken }) => {
      const group = selectRobotsGroup(groups, robotsToken);
      const isAllowed =
        group === null || isPathAllowed(AI_READINESS_HOMEPAGE_PATH, group);

      return [id, isAllowed ? 'ALLOWED' : 'BLOCKED'];
    }),
  ) as Record<AiCrawlerId, AiCrawlerAccessStatus>;
};
