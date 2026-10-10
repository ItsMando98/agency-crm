import { describe, expect, it, vi } from 'vitest';

import { processAsset, type AssetStore } from 'src/generation/process-asset';
import { type AssetRecord } from 'src/types/asset-record';

const credentials = { token: 'agent-token', organization: null };

const buildStore = (overrides: Partial<AssetStore> = {}): AssetStore => ({
  loadCreator: vi.fn(async () => ({
    persona: 'Mara',
    appearancePrompt: 'braune Haare',
    niche: null,
    language: 'DE' as const,
    voiceName: 'Puck',
    rules: null,
  })),
  markRunning: vi.fn(async () => undefined),
  uploadFile: vi.fn(async () => ({ id: 'file-1' })),
  markDone: vi.fn(async () => undefined),
  markFailed: vi.fn(async () => undefined),
  ...overrides,
});

const voiceAsset: AssetRecord = {
  id: 'asset-1',
  type: 'VOICE',
  prompt: null,
  script: 'Hallo zusammen',
  durationSeconds: null,
  creatorId: 'creator-1',
};

const voiceFetch = (async () =>
  new Response(
    JSON.stringify({
      candidates: [{ content: { parts: [{ inlineData: { data: Buffer.from('RIFF').toString('base64') } }] } }],
    }),
    { status: 200, headers: { 'content-type': 'application/json', 'x-treg-cost-micro': '900' } },
  )) as unknown as typeof fetch;

describe('processAsset', () => {
  it('generates, uploads and marks the asset done with its cost', async () => {
    const store = buildStore();

    await processAsset({ asset: voiceAsset, store, credentials, fetchImplementation: voiceFetch });

    expect(store.markRunning).toHaveBeenCalledWith('asset-1');
    expect(store.uploadFile).toHaveBeenCalledWith(
      expect.objectContaining({ fileName: 'voice-asset-1.wav' }),
    );
    expect(store.markDone).toHaveBeenCalledWith('asset-1', {
      fileId: 'file-1',
      label: 'voice-asset-1.wav',
      costUsd: 0.0009,
      endpointId: 'google-ai.voice-gen.gemini-3-8-flash-tts',
    });
    expect(store.markFailed).not.toHaveBeenCalled();
  });

  it('fails the asset without calling treg when no token is saved', async () => {
    const store = buildStore();
    const fetchImplementation = vi.fn();

    await processAsset({
      asset: voiceAsset,
      store,
      credentials: null,
      fetchImplementation: fetchImplementation as unknown as typeof fetch,
    });

    expect(store.markFailed).toHaveBeenCalledWith('asset-1', expect.stringContaining('TREG_TOKEN'));
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it('fails an asset that has no creator', async () => {
    const store = buildStore();

    await processAsset({ asset: { ...voiceAsset, creatorId: null }, store, credentials });

    expect(store.markFailed).toHaveBeenCalledWith('asset-1', expect.stringContaining('creator profile'));
  });

  it('records the provider error instead of throwing', async () => {
    const store = buildStore();
    const failing = (async () =>
      new Response(JSON.stringify({ error: 'x' }), { status: 402, headers: { 'content-type': 'application/json' } })) as unknown as typeof fetch;

    await expect(
      processAsset({ asset: voiceAsset, store, credentials, fetchImplementation: failing }),
    ).resolves.toBeUndefined();
    expect(store.markFailed).toHaveBeenCalledWith('asset-1', expect.stringContaining('balance is too low'));
  });

  it('refuses a voice asset without any text', async () => {
    const store = buildStore();

    await processAsset({
      asset: { ...voiceAsset, script: null, prompt: '  ' },
      store,
      credentials,
      fetchImplementation: voiceFetch,
    });

    expect(store.markFailed).toHaveBeenCalledWith('asset-1', 'A voice asset needs a script to read.');
  });
});
