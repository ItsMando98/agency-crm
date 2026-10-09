import {
  type AI_ENGINES,
  AI_REQUEST_TIMEOUT_MS,
} from 'src/constants/ai-visibility.const';
import { requestDataForSeo } from 'src/dataforseo-client/request-dataforseo';
import { type DataForSeoCredentials } from 'src/types/data-for-seo-credentials';
import { type AiAnswer } from 'src/types/ai-visibility';
import { parseAiAnswer } from 'src/utils/parse-ai-answer.util';

type FetchAiAnswerParams = {
  credentials: DataForSeoCredentials;
  engine: (typeof AI_ENGINES)[number];
  query: string;
  fetchImplementation?: typeof fetch;
};

export const fetchAiAnswer = async ({
  credentials,
  engine,
  query,
  fetchImplementation,
}: FetchAiAnswerParams): Promise<{ answer: AiAnswer | null; cost: number }> => {
  const { result, cost } = await requestDataForSeo({
    credentials,
    path: engine.path,
    body: [
      {
        user_prompt: query,
        model_name: engine.modelName,
        ...(engine.needsWebSearchFlag ? { web_search: true } : {}),
      },
    ],
    timeoutMs: AI_REQUEST_TIMEOUT_MS,
    fetchImplementation,
  });

  return { answer: parseAiAnswer(result), cost };
};
