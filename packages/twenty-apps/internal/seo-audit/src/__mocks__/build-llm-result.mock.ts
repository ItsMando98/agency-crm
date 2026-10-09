type LlmResultOverrides = {
  text?: string;
  sourceUrls?: string[];
};

// Same shape as a DataForSEO LLM response: one message with a text section and its sources.
export const buildLlmResult = ({
  text = 'Hier steht eine ausführliche Antwort über Anbieter in der Region.',
  sourceUrls = [],
}: LlmResultOverrides = {}) => ({
  model_name: 'test-model',
  items: [
    { type: 'reasoning' },
    {
      type: 'message',
      sections: [
        {
          type: 'text',
          text,
          annotations: sourceUrls.map((url) => ({ url, title: null })),
        },
      ],
    },
  ],
});
