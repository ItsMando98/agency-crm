import {
  VIDEO_DURATIONS_SECONDS,
  VIDEO_USD_PER_SECOND_SILENT,
  VIDEO_USD_PER_SECOND_WITH_AUDIO,
} from 'src/constants/creator-studio.const';

// Veo takes 4, 6 or 8 seconds. Any other request is moved to the nearest allowed length.
export const normalizeVideoDuration = (requestedSeconds: number | null): number => {
  const requested = requestedSeconds ?? VIDEO_DURATIONS_SECONDS[VIDEO_DURATIONS_SECONDS.length - 1];

  return VIDEO_DURATIONS_SECONDS.reduce((nearest, candidate) =>
    Math.abs(candidate - requested) < Math.abs(nearest - requested) ? candidate : nearest,
  );
};

export const estimateVideoCostUsd = (durationSeconds: number, withAudio: boolean): number =>
  Math.round(
    durationSeconds *
      (withAudio ? VIDEO_USD_PER_SECOND_WITH_AUDIO : VIDEO_USD_PER_SECOND_SILENT) *
      100,
  ) / 100;
