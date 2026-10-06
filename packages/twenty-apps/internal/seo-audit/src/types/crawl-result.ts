import { type CrawledPage } from 'src/types/crawled-page';

export type CrawlResult = {
  origin: string;
  pages: CrawledPage[];
  linkTargetStatusCodes: Record<string, number>;
  linksByPage: Record<string, string[]>;
  robotsTxtFound: boolean;
  sitemapFound: boolean;
  blockedByRobotsCount: number;
};
