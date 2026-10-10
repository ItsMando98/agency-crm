import { ASSET_STATUS } from 'src/constants/creator-studio.const';
import { type AssetStore } from 'src/generation/process-asset';
import { UGC_ASSET_FILE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/objects/ugc-asset.object';
import { type CreatorProfile } from 'src/types/creator-profile';

// Method syntax keeps the parameters bivariant, so the generated typed clients fit.
type CoreClientLike = {
  query(query: unknown): Promise<unknown>;
  mutation(mutation: unknown): Promise<unknown>;
};

type MetadataClientLike = {
  uploadFile(params: {
    fileBuffer: Buffer;
    filename: string;
    fieldMetadataUniversalIdentifier: string;
  }): Promise<{ id: string }>;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;

const asNullableString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() !== '' ? value : null;

export const buildAssetStore = ({
  client,
  metadataClient,
  now = () => new Date(),
}: {
  client: CoreClientLike;
  metadataClient: MetadataClientLike;
  now?: () => Date;
}): AssetStore => {
  const updateAsset = async (assetId: string, data: Record<string, unknown>) => {
    await client.mutation({
      updateUgcAsset: { __args: { id: assetId, data }, id: true },
    });
  };

  return {
    loadCreator: async (creatorId): Promise<CreatorProfile | null> => {
      const result = asRecord(
        await client.query({
          ugcCreators: {
            __args: { filter: { id: { eq: creatorId } }, first: 1 },
            edges: {
              node: {
                id: true,
                persona: true,
                appearancePrompt: true,
                niche: true,
                language: true,
                voiceName: true,
                rules: true,
              },
            },
          },
        }),
      );
      const edges = asRecord(result?.ugcCreators)?.edges;
      const node = asRecord(asRecord(Array.isArray(edges) ? edges[0] : null)?.node);

      if (node === null) {
        return null;
      }

      return {
        persona: asNullableString(node.persona),
        appearancePrompt: asNullableString(node.appearancePrompt),
        niche: asNullableString(node.niche),
        language: node.language === 'EN' ? 'EN' : 'DE',
        voiceName: asNullableString(node.voiceName),
        rules: asNullableString(node.rules),
      };
    },
    markRunning: (assetId) =>
      updateAsset(assetId, {
        status: ASSET_STATUS.RUNNING,
        startedAt: now().toISOString(),
        failureReason: null,
      }),
    uploadFile: ({ bytes, fileName }) =>
      metadataClient.uploadFile({
        fileBuffer: Buffer.from(bytes),
        filename: fileName,
        fieldMetadataUniversalIdentifier: UGC_ASSET_FILE_FIELD_UNIVERSAL_IDENTIFIER,
      }),
    markDone: (assetId, { fileId, label, costUsd, endpointId }) =>
      updateAsset(assetId, {
        status: ASSET_STATUS.DONE,
        file: [{ fileId, label }],
        costUsd,
        providerEndpoint: endpointId,
        finishedAt: now().toISOString(),
      }),
    markFailed: (assetId, reason) =>
      updateAsset(assetId, {
        status: ASSET_STATUS.FAILED,
        failureReason: reason.slice(0, 500),
        finishedAt: now().toISOString(),
      }),
  };
};
