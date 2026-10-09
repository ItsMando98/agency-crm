import { type AiAnswer, type AiAnswerSource } from 'src/types/ai-visibility';
import { asRecord } from 'src/utils/as-record.util';

const asNonEmptyString = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null;

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

// The sources list holds every citation, the pills only the first few, so both are read.
export const parseCloroAnswer = (response: unknown): AiAnswer | null => {
  const record = asRecord(response);
  const result = asRecord(record?.result);

  if (record === null || record.success === false || result === null) {
    return null;
  }

  const sourcesByUrl = new Map<string, AiAnswerSource>();

  [...asArray(result.sources), ...asArray(result.citationPills)].forEach((entry) => {
    const source = asRecord(entry);
    const url = asNonEmptyString(source?.url);

    if (url !== null && !sourcesByUrl.has(url)) {
      sourcesByUrl.set(url, { url, title: asNonEmptyString(source?.label) });
    }
  });

  return {
    text: typeof result.text === 'string' ? result.text : '',
    sources: [...sourcesByUrl.values()],
  };
};
