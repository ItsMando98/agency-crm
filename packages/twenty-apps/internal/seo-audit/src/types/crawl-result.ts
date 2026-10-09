import { type CrawledPage } from 'src/types/crawled-page';

export type CrawlResult = {
  origin: string;
  pages: CrawledPage[];
  linkTargetStatusCodes: Record<string, number>;
  linksByPage: Record<string, string[]>;
  robotsTxtFound: boolean;
  // Raw file content, kept so the AI crawler rules can be read without a second request.
  robotsTxt: string | null;
  llmsTxtFound: boolean;
  sitemapFound: boolean;
  blockedByRobotsCount: number;
};
