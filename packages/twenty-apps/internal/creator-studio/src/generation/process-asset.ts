import { buildImagePrompt, buildVideoPrompt } from 'src/generation/build-prompts';
import { normalizeVideoDuration } from 'src/generation/estimate-video-cost';
import {
  generateImage,
  generateVideo,
  generateVoice,
  type GeneratedMedia,
} from 'src/generation/generate-media';
import { type AssetRecord } from 'src/types/asset-record';
import { type CreatorProfile } from 'src/types/creator-profile';
import { type TregCredentials } from 'src/types/treg-credentials';

export type AssetStore = {
  loadCreator: (creatorId: string) => Promise<CreatorProfile | null>;
  markRunning: (assetId: string) => Promise<void>;
  uploadFile: (params: { bytes: Uint8Array; fileName: string }) => Promise<{ id: string }>;
  markDone: (
    assetId: string,
    result: { fileId: string; label: string; costUsd: number; endpointId: string },
  ) => Promise<void>;
  markFailed: (assetId: string, reason: string) => Promise<void>;
};

type ProcessAssetParams = {
  asset: AssetRecord;
  store: AssetStore;
  credentials: TregCredentials | null;
  fetchImplementation?: typeof fetch;
  sleep?: (milliseconds: number) => Promise<void>;
};

const DEFAULT_SCENE = 'a natural everyday moment';

const generate = async ({
  asset,
  creator,
  credentials,
  fetchImplementation,
  sleep,
}: {
  asset: AssetRecord;
  creator: CreatorProfile;
  credentials: TregCredentials;
  fetchImplementation?: typeof fetch;
  sleep?: (milliseconds: number) => Promise<void>;
}): Promise<GeneratedMedia> => {
  const shared = { credentials, fetchImplementation, sleep };
  const scene = asset.prompt?.trim() || DEFAULT_SCENE;

  if (asset.type === 'IMAGE') {
    return generateImage({ ...shared, prompt: buildImagePrompt(creator, scene) });
  }

  if (asset.type === 'VOICE') {
    const text = asset.script?.trim() || asset.prompt?.trim() || '';

    if (text === '') {
      throw new Error('A voice asset needs a script to read.');
    }

    return generateVoice({ ...shared, text, voiceName: creator.voiceName });
  }

  return generateVideo({
    ...shared,
    prompt: buildVideoPrompt(creator, scene, asset.script),
    durationSeconds: normalizeVideoDuration(asset.durationSeconds),
  });
};

// Never throws: a failure ends on the record, so a queue of assets keeps going.
export const processAsset = async ({
  asset,
  store,
  credentials,
  fetchImplementation,
  sleep,
}: ProcessAssetParams): Promise<void> => {
  try {
    if (credentials === null) {
      throw new Error('No treg token is saved. Add TREG_TOKEN in the app variables.');
    }

    if (asset.creatorId === null) {
      throw new Error('The asset is not linked to a creator profile.');
    }

    const creator = await store.loadCreator(asset.creatorId);

    if (creator === null) {
      throw new Error('The creator profile of this asset no longer exists.');
    }

    await store.markRunning(asset.id);

    const media = await generate({ asset, creator, credentials, fetchImplementation, sleep });
    const fileName = `${asset.type.toLowerCase()}-${asset.id}.${media.extension}`;
    const uploaded = await store.uploadFile({ bytes: media.bytes, fileName });

    await store.markDone(asset.id, {
      fileId: uploaded.id,
      label: fileName,
      costUsd: media.costUsd,
      endpointId: media.endpointId,
    });
  } catch (error) {
    await store.markFailed(
      asset.id,
      error instanceof Error ? error.message : 'The generation failed.',
    );
  }
};
