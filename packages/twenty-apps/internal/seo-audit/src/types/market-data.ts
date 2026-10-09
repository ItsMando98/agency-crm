import { type BacklinkSummary } from 'src/types/backlink-summary';
import { type BacklinkTarget } from 'src/types/backlink-target';
import { type Competitor } from 'src/types/competitor';
import { type LighthouseSummary } from 'src/types/lighthouse-summary';
import { type RankingsSummary } from 'src/types/rankings-summary';

export type MarketData = {
  rankings: RankingsSummary | null;
  backlinks: BacklinkSummary | null;
  backlinkTargets: BacklinkTarget[];
  competitors: Competitor[];
  lighthouse: LighthouseSummary | null;
  costUsd: number;
  // One line per request that failed, so a partial audit explains itself.
  notes: string[];
};
