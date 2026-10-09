import { type AI_ENGINES } from 'src/constants/ai-visibility.const';

export type AiEngineId = (typeof AI_ENGINES)[number]['id'];

export type AiAnswerStatus = 'CITED' | 'MENTIONED' | 'ABSENT' | 'UNKNOWN';

export type AiAnswerSource = {
  url: string;
  title: string | null;
};

export type AiAnswer = {
  text: string;
  sources: AiAnswerSource[];
};

export type AiVisibilityRow = {
  query: string;
  results: Record<AiEngineId, AiAnswerStatus>;
  // Other domains the AI systems named for this question, most often first.
  instead: string[];
};

export type AiVisibility = {
  rows: AiVisibilityRow[];
  engines: AiEngineId[];
  // Share of answers that name the website: cited counts 1, mentioned 0.5. Null when nothing could be judged.
  presenceRate: number | null;
  // Questions with at least one answer that could be judged.
  queriesTested: number;
  testedAt: string;
  costUsd: number;
  notes: string[];
};
