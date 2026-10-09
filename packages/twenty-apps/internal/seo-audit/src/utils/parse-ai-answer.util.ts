import { type AiAnswer, type AiAnswerSource } from 'src/types/ai-visibility';
import { asRecord } from 'src/utils/as-record.util';

const asNonEmptyString = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null;

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

// Gemini answers with a Google redirect in `url` and the real page in `direct_url`.
const parseSource = (annotation: unknown): AiAnswerSource | null => {
  const record = asRecord(annotation);
  const url = asNonEmptyString(record?.direct_url) ?? asNonEmptyString(record?.url);

  return url === null ? null : { url, title: asNonEmptyString(record?.title) };
};

export const parseAiAnswer = (result: unknown): AiAnswer | null => {
  const message = asArray(asRecord(result)?.items)
    .map(asRecord)
    .find((item) => item?.type === 'message');

  if (message === undefined || message === null) {
    return null;
  }

  const sections = asArray(message.sections).map(asRecord);

  return {
    text: sections
      .map((section) => asNonEmptyString(section?.text))
      .filter((text): text is string => text !== null)
      .join('\n'),
    sources: sections
      .flatMap((section) => asArray(section?.annotations))
      .map(parseSource)
      .filter((source): source is AiAnswerSource => source !== null),
  };
};
