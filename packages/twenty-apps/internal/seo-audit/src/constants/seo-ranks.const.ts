import { type SeoEffort } from 'src/types/seo-effort';
import { type SeoPriority } from 'src/types/seo-priority';

export const PRIORITY_RANK: Record<SeoPriority, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export const EFFORT_RANK: Record<SeoEffort, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
};
