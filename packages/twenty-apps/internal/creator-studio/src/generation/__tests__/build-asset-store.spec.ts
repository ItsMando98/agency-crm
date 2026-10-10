import { describe, expect, it, vi } from 'vitest';

import { buildAssetStore } from 'src/generation/build-asset-store';

const NOW = new Date('2026-10-10T12:00:00Z');

describe('buildAssetStore', () => {
  it('reads the creator profile and defaults the language', async () => {
    const query = vi.fn(async () => ({
      ugcCreators: {
        edges: [{ node: { id: 'c1', persona: 'Mara', appearancePrompt: ' ', niche: null, language: 'EN', voiceName: 'Puck', rules: 'Keine Versprechen' } }],
      },
    }));
    const store = buildAssetStore({ client: { query, mutation: vi.fn() }, metadataClient: { uploadFile: vi.fn() } });

    expect(await store.loadCreator('c1')).toEqual({
      persona: 'Mara',
      appearancePrompt: null,
      niche: null,
      language: 'EN',
      voiceName: 'Puck',
      rules: 'Keine Versprechen',
    });
    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({
        ugcCreators: expect.objectContaining({ __args: { filter: { id: { eq: 'c1' } }, first: 1 } }),
      }),
    );
  });

  it('returns null for a creator that does not exist', async () => {
    const store = buildAssetStore({
      client: { query: vi.fn(async () => ({ ugcCreators: { edges: [] } })), mutation: vi.fn() },
      metadataClient: { uploadFile: vi.fn() },
    });

    expect(await store.loadCreator('missing')).toBeNull();
  });

  it('writes status, file and cost when done', async () => {
    const mutation = vi.fn(async () => ({}));
    const store = buildAssetStore({
      client: { query: vi.fn(), mutation },
      metadataClient: { uploadFile: vi.fn() },
      now: () => NOW,
    });

    await store.markDone('a1', { fileId: 'f1', label: 'image-a1.jpg', costUsd: 0.03, endpointId: 'reapi.image-gen.gemini-3-pro-image' });

    expect(mutation).toHaveBeenCalledWith({
      updateUgcAsset: {
        __args: {
          id: 'a1',
          data: {
            status: 'DONE',
            file: [{ fileId: 'f1', label: 'image-a1.jpg' }],
            costUsd: 0.03,
            providerEndpoint: 'reapi.image-gen.gemini-3-pro-image',
            finishedAt: '2026-10-10T12:00:00.000Z',
          },
        },
        id: true,
      },
    });
  });

  it('shortens a very long failure reason', async () => {
    const mutation = vi.fn(async () => ({}));
    const store = buildAssetStore({ client: { query: vi.fn(), mutation }, metadataClient: { uploadFile: vi.fn() }, now: () => NOW });

    await store.markFailed('a1', 'x'.repeat(900));

    const data = (mutation.mock.calls[0] as unknown as [{ updateUgcAsset: { __args: { data: { failureReason: string; status: string } } } }])[0].updateUgcAsset.__args.data;

    expect(data.status).toBe('FAILED');
    expect(data.failureReason).toHaveLength(500);
  });

  it('uploads to the file field of the asset object', async () => {
    const uploadFile = vi.fn(async () => ({ id: 'file-9' }));
    const store = buildAssetStore({ client: { query: vi.fn(), mutation: vi.fn() }, metadataClient: { uploadFile } });

    const uploaded = await store.uploadFile({ bytes: new Uint8Array([1, 2]), fileName: 'voice-a1.wav' });

    expect(uploaded).toEqual({ id: 'file-9' });
    expect(uploadFile).toHaveBeenCalledWith(
      expect.objectContaining({ filename: 'voice-a1.wav', fieldMetadataUniversalIdentifier: expect.any(String) }),
    );
  });
});
