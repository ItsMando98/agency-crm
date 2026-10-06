import { EFFORT_RANK, PRIORITY_RANK } from 'src/constants/seo-ranks.const';
import { type SeoEffort } from 'src/types/seo-effort';
import { type SeoPriority } from 'src/types/seo-priority';

type SortableTask = { priority: SeoPriority; effort: SeoEffort };

// Most important first, and within a priority the cheapest fix first.
export const sortTasksByPriority = <TTask extends SortableTask>(tasks: TTask[]): TTask[] =>
  [...tasks].sort(
    (first, second) =>
      (PRIORITY_RANK[first.priority] ?? 99) - (PRIORITY_RANK[second.priority] ?? 99) ||
      (EFFORT_RANK[first.effort] ?? 99) - (EFFORT_RANK[second.effort] ?? 99),
  );
