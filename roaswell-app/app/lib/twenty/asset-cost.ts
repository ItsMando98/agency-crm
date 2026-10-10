const IMAGE_USD = 0.03;
const VOICE_USD = 0.01;
const VIDEO_USD_PER_SECOND_WITH_AUDIO = 0.15;

// Upper estimates, shown before the order. The real cost is stored on the asset.
export const estimateAssetCostUsd = (
  type: 'IMAGE' | 'VOICE' | 'VIDEO',
  durationSeconds = 8,
): number =>
  type === 'IMAGE'
    ? IMAGE_USD
    : type === 'VOICE'
      ? VOICE_USD
      : Math.round(durationSeconds * VIDEO_USD_PER_SECOND_WITH_AUDIO * 100) / 100;

export const formatUsd = (amount: number | null): string =>
  amount === null
    ? '-'
    : `${amount < 0.1 ? amount.toFixed(3) : amount.toFixed(2)} USD`.replace('.', ',');
