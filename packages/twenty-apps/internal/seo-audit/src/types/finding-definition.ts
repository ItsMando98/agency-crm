import { type SeoArea } from 'src/types/seo-area';
import { type SeoEffort } from 'src/types/seo-effort';
import { type SeoPriority } from 'src/types/seo-priority';
import { type SeoTaskSource } from 'src/types/seo-task-source';

type FindingText = {
  title: string;
  recommendation: string;
};

export type FindingDefinition = {
  area: SeoArea;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  priority: SeoPriority;
  effort: SeoEffort;
  source: SeoTaskSource;
  text: { DE: FindingText; EN: FindingText };
};
