import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { defineLogicFunction, type ObjectRecordCreateEvent } from 'twenty-sdk/define';
import { type DatabaseEventBatchPayload } from 'twenty-sdk/logic-function';

import { ASSET_STATUS } from 'src/constants/creator-studio.const';
import { buildAssetStore } from 'src/generation/build-asset-store';
import { processAsset } from 'src/generation/process-asset';
import { type AssetRecord } from 'src/types/asset-record';
import { readTregCredentials } from 'src/utils/read-treg-credentials.util';

type UgcAssetEventRecord = {
  status?: string | null;
  assetType?: string | null;
  prompt?: string | null;
  script?: string | null;
  durationSeconds?: number | null;
  creatorId?: string | null;
};

const ASSET_TYPES = ['IMAGE', 'VOICE', 'VIDEO'] as const;

const handler = async (
  batch: DatabaseEventBatchPayload<ObjectRecordCreateEvent<UgcAssetEventRecord>>,
): Promise<void> => {
  const store = buildAssetStore({
    client: new CoreApiClient(),
    metadataClient: new MetadataApiClient(),
  });
  const credentials = readTregCredentials();

  // One asset after another: a video can run for minutes and treg bills each call.
  for (const event of batch.events) {
    const record = event.properties.after;
    const type = ASSET_TYPES.find((candidate) => candidate === record.assetType);

    if (typeof record.status === 'string' && record.status !== ASSET_STATUS.QUEUED) {
      continue;
    }

    const asset: AssetRecord = {
      id: event.recordId,
      type: type ?? 'IMAGE',
      prompt: record.prompt ?? null,
      script: record.script ?? null,
      durationSeconds: record.durationSeconds ?? null,
      creatorId: record.creatorId ?? null,
    };

    await processAsset({ asset, store, credentials });
  }
};

export default defineLogicFunction({
  universalIdentifier: 'a2bb21bf-0c80-4f2b-8a47-3b5b0c8ce6f1',
  name: 'run-ugc-asset',
  description:
    'Generates the picture, voice or video of a newly created UGC asset through treg and attaches the file to the record.',
  timeoutSeconds: 600,
  databaseEventTriggerSettings: {
    eventName: 'ugcAsset.created',
    batchMode: true,
  },
  handler,
});
