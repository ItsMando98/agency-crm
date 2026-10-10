import type Anthropic from '@anthropic-ai/sdk';

import { type AiUsage } from 'src/types/ai-usage';

type ResponseWithUsage = { usage?: { input_tokens?: number; output_tokens?: number } | null };

export const createUsageTracker = () => {
  const usageByModel: AiUsage = {};

  return {
    record: (model: string, response: ResponseWithUsage): void => {
      const previous = usageByModel[model] ?? { calls: 0, inputTokens: 0, outputTokens: 0 };

      usageByModel[model] = {
        calls: previous.calls + 1,
        inputTokens: previous.inputTokens + (response.usage?.input_tokens ?? 0),
        outputTokens: previous.outputTokens + (response.usage?.output_tokens ?? 0),
      };
    },
    snapshot: (): AiUsage =>
      Object.fromEntries(Object.entries(usageByModel).map(([model, usage]) => [model, { ...usage }])),
  };
};

export type UsageTracker = ReturnType<typeof createUsageTracker>;

// Wraps messages.create only, so every module keeps using the client as before.
export const withUsageTracking = (client: Anthropic, tracker: UsageTracker): Anthropic =>
  new Proxy(client, {
    get(target, property, receiver) {
      if (property !== 'messages') {
        return Reflect.get(target, property, receiver);
      }

      return new Proxy(target.messages, {
        get(messages, messageProperty, messagesReceiver) {
          if (messageProperty !== 'create') {
            return Reflect.get(messages, messageProperty, messagesReceiver);
          }

          return async (params: { model: string }, ...rest: unknown[]) => {
            const response = await (
              messages.create as (...args: unknown[]) => Promise<ResponseWithUsage>
            ).call(messages, params, ...rest);

            tracker.record(params.model, response);

            return response;
          };
        },
      });
    },
  });
