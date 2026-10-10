export type ModelUsage = {
  calls: number;
  inputTokens: number;
  outputTokens: number;
};

// Tokens per model, so the cost of an audit can be worked out from the price list.
export type AiUsage = Record<string, ModelUsage>;
