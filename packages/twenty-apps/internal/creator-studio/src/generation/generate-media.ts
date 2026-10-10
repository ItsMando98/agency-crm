import {
  DEFAULT_VOICE_NAME,
  IMAGE_MAX_COST_USD,
  IMAGE_MAX_WAIT_MS,
  IMAGE_MODEL,
  MEDIA_DOWNLOAD_USER_AGENT,
  POLL_INTERVAL_MS,
  TREG_ENDPOINTS,
  VIDEO_MAX_WAIT_MS,
  VOICE_MAX_COST_USD,
  VOICE_MODEL,
} from 'src/constants/creator-studio.const';
import { estimateVideoCostUsd } from 'src/generation/estimate-video-cost';
import { callTreg } from 'src/treg-client/call-treg';
import { pollTask, type TaskState } from 'src/treg-client/poll-task';
import { type TregCredentials } from 'src/types/treg-credentials';

export type GeneratedMedia = {
  bytes: Uint8Array;
  mimeType: string;
  extension: string;
  costUsd: number;
  endpointId: string;
};

type Dependencies = {
  credentials: TregCredentials;
  fetchImplementation?: typeof fetch;
  sleep?: (milliseconds: number) => Promise<void>;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const firstString = (value: unknown): string | null => {
  if (typeof value === 'string' && value !== '') {
    return value;
  }

  if (Array.isArray(value)) {
    const first: unknown = value[0];

    return typeof first === 'string' && first !== '' ? first : null;
  }

  return null;
};

const download = async (
  url: string,
  fetchImplementation: typeof fetch,
): Promise<{ bytes: Uint8Array; mimeType: string }> => {
  const response = await fetchImplementation(url, {
    headers: { 'user-agent': MEDIA_DOWNLOAD_USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(`The generated file could not be downloaded (HTTP ${response.status}).`);
  }

  return {
    bytes: new Uint8Array(await response.arrayBuffer()),
    mimeType: response.headers.get('content-type')?.split(';')[0]?.trim() ?? 'application/octet-stream',
  };
};

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'audio/wav': 'wav',
};

const extensionFor = (mimeType: string, fallback: string): string =>
  EXTENSION_BY_MIME_TYPE[mimeType] ?? fallback;

export const generateImage = async ({
  credentials,
  fetchImplementation = fetch,
  sleep,
  prompt,
  aspectRatio = '9:16',
}: Dependencies & { prompt: string; aspectRatio?: string }): Promise<GeneratedMedia> => {
  const submitted = await callTreg({
    credentials,
    endpointId: TREG_ENDPOINTS.IMAGE,
    body: { model: IMAGE_MODEL, prompt, size: aspectRatio, resolution: '1K' },
    maxCostUsd: IMAGE_MAX_COST_USD,
    fetchImplementation,
  });
  const taskId = asRecord(submitted.body)?.id;

  if (typeof taskId !== 'string') {
    throw new Error('The image service did not return a task id.');
  }

  const imageUrl = await pollTask<string>({
    intervalMs: POLL_INTERVAL_MS,
    maxWaitMs: IMAGE_MAX_WAIT_MS,
    sleep,
    fetchState: async (): Promise<TaskState<string>> => {
      const { body } = await callTreg({
        credentials,
        endpointId: TREG_ENDPOINTS.IMAGE_TASK,
        method: 'GET',
        query: { id: taskId },
        fetchImplementation,
      });
      const task = asRecord(body);

      if (task?.status === 'completed') {
        const url = firstString(asRecord(task.output)?.image_urls);

        return url === null
          ? { state: 'FAILED', message: 'The image task finished without an image.' }
          : { state: 'SUCCEEDED', result: url };
      }

      if (task?.status === 'failed') {
        const error = asRecord(task.error)?.message ?? task.error;

        return {
          state: 'FAILED',
          message: typeof error === 'string' ? error : 'The image could not be generated.',
        };
      }

      return { state: 'PENDING' };
    },
  });
  const file = await download(imageUrl, fetchImplementation);

  return {
    ...file,
    extension: extensionFor(file.mimeType, 'png'),
    costUsd: submitted.costUsd,
    endpointId: TREG_ENDPOINTS.IMAGE,
  };
};

export const generateVoice = async ({
  credentials,
  fetchImplementation = fetch,
  text,
  voiceName,
}: Dependencies & { text: string; voiceName: string | null }): Promise<GeneratedMedia> => {
  const { body, costUsd } = await callTreg({
    credentials,
    endpointId: TREG_ENDPOINTS.VOICE,
    query: {
      model: VOICE_MODEL,
      fields: 'candidates(content(parts(inlineData)),finishReason),usageMetadata',
    },
    body: {
      contents: [{ parts: [{ text }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName ?? DEFAULT_VOICE_NAME } },
        },
      },
    },
    maxCostUsd: VOICE_MAX_COST_USD,
    fetchImplementation,
  });
  const candidates = asRecord(body)?.candidates;
  const parts = asRecord(asRecord(Array.isArray(candidates) ? candidates[0] : null)?.content)?.parts;
  const inlineData = asRecord(asRecord(Array.isArray(parts) ? parts[0] : null)?.inlineData);
  const data = inlineData?.data;

  if (typeof data !== 'string' || data === '') {
    throw new Error('The voice service returned no audio.');
  }

  return {
    bytes: new Uint8Array(Buffer.from(data, 'base64')),
    mimeType: 'audio/wav',
    extension: 'wav',
    costUsd,
    endpointId: TREG_ENDPOINTS.VOICE,
  };
};

export const generateVideo = async ({
  credentials,
  fetchImplementation = fetch,
  sleep,
  prompt,
  durationSeconds,
  aspectRatio = '9:16',
  withAudio = true,
}: Dependencies & {
  prompt: string;
  durationSeconds: number;
  aspectRatio?: string;
  withAudio?: boolean;
}): Promise<GeneratedMedia> => {
  const submitted = await callTreg({
    credentials,
    endpointId: TREG_ENDPOINTS.VIDEO,
    body: {
      input: {
        prompt,
        duration: durationSeconds,
        resolution: '720p',
        aspect_ratio: aspectRatio,
        generate_audio: withAudio,
      },
    },
    maxCostUsd: estimateVideoCostUsd(durationSeconds, withAudio) + 0.05,
    fetchImplementation,
  });
  const predictionId = asRecord(submitted.body)?.id;

  if (typeof predictionId !== 'string') {
    throw new Error('The video service did not return a prediction id.');
  }

  const videoUrl = await pollTask<string>({
    intervalMs: POLL_INTERVAL_MS,
    maxWaitMs: VIDEO_MAX_WAIT_MS,
    sleep,
    fetchState: async (): Promise<TaskState<string>> => {
      const { body } = await callTreg({
        credentials,
        endpointId: TREG_ENDPOINTS.VIDEO_TASK,
        method: 'GET',
        query: { id: predictionId },
        fetchImplementation,
      });
      const prediction = asRecord(body);

      if (prediction?.status === 'succeeded') {
        const url = firstString(prediction.output);

        return url === null
          ? { state: 'FAILED', message: 'The video finished without a file.' }
          : { state: 'SUCCEEDED', result: url };
      }

      if (prediction?.status === 'failed' || prediction?.status === 'canceled') {
        return {
          state: 'FAILED',
          message:
            typeof prediction.error === 'string'
              ? prediction.error
              : 'The video could not be generated.',
        };
      }

      return { state: 'PENDING' };
    },
  });
  const file = await download(videoUrl, fetchImplementation);

  return {
    ...file,
    extension: extensionFor(file.mimeType, 'mp4'),
    costUsd: submitted.costUsd,
    endpointId: TREG_ENDPOINTS.VIDEO,
  };
};
