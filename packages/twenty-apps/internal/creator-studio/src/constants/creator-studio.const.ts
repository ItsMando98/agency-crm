export const TREG_BASE_URL = 'https://treg.to';

export const ASSET_STATUS = {
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING',
  DONE: 'DONE',
  FAILED: 'FAILED',
} as const;

export const ASSET_TYPE = {
  IMAGE: 'IMAGE',
  VOICE: 'VOICE',
  VIDEO: 'VIDEO',
} as const;

export const CREATOR_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const;

export const TREG_ENDPOINTS = {
  IMAGE: 'reapi.image-gen.gemini-3-pro-image',
  IMAGE_TASK: 'reapi.tasks.get',
  VOICE: 'google-ai.voice-gen.gemini-3-8-flash-tts',
  VIDEO: 'replicate.video-gen.veo-3.1-fast',
  VIDEO_TASK: 'replicate.predictions.get',
} as const;

export const IMAGE_MODEL = 'gemini-3-pro-image-preview';
export const VOICE_MODEL = 'gemini-3.8-flash-tts';
export const DEFAULT_VOICE_NAME = 'Kore';

// Veo accepts only these lengths. A request for 5 seconds is refused.
export const VIDEO_DURATIONS_SECONDS = [4, 6, 8] as const;
export const VIDEO_USD_PER_SECOND_SILENT = 0.1;
export const VIDEO_USD_PER_SECOND_WITH_AUDIO = 0.15;

// Per call ceilings. treg refuses a call that would cost more and charges nothing.
export const IMAGE_MAX_COST_USD = 0.1;
export const VOICE_MAX_COST_USD = 0.1;

export const TREG_REQUEST_TIMEOUT_MS = 60_000;
export const POLL_INTERVAL_MS = 5_000;
export const IMAGE_MAX_WAIT_MS = 180_000;
export const VIDEO_MAX_WAIT_MS = 480_000;
export const STUCK_ASSET_TIMEOUT_MINUTES = 20;
export const MEDIA_DOWNLOAD_USER_AGENT = 'Mozilla/5.0 (compatible; CreatorStudio/0.1)';
