import { describe, expect, it } from 'vitest';

import { buildImagePrompt, buildVideoPrompt } from 'src/generation/build-prompts';
import { estimateVideoCostUsd, normalizeVideoDuration } from 'src/generation/estimate-video-cost';
import { generateImage, generateVideo, generateVoice } from 'src/generation/generate-media';
import { type CreatorProfile } from 'src/types/creator-profile';

const credentials = { token: 'agent-token', organization: null };
const noSleep = async () => undefined;

type Handler = (url: string, init?: RequestInit) => Response;

const routeFetch = (handlers: [string, Handler][]) => {
  const calls: { url: string; init?: RequestInit }[] = [];
  const fetchImplementation = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);

    calls.push({ url, init });

    const handler = handlers.find(([prefix]) => url.startsWith(prefix));

    return handler === undefined ? new Response('not found', { status: 404 }) : handler[1](url, init);
  }) as typeof fetch;

  return { fetchImplementation, calls };
};

const json = (body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json', ...headers } });

const creator: CreatorProfile = {
  persona: 'Mara, 29, Fitnesscoach aus Köln',
  appearancePrompt: 'kurze braune Haare, freundliches Lächeln',
  niche: 'Home Workouts',
  language: 'DE',
  voiceName: null,
  rules: 'Keine Gesundheitsversprechen',
};

describe('prompts and cost', () => {
  it('builds an image prompt that keeps the persona and rules', () => {
    const prompt = buildImagePrompt(creator, 'im Wohnzimmer mit Yogamatte');

    expect(prompt).toContain('kurze braune Haare');
    expect(prompt).toContain('Mara, 29');
    expect(prompt).toContain('im Wohnzimmer mit Yogamatte');
    expect(prompt).toContain('Keine Gesundheitsversprechen');
  });

  it('puts the spoken line and its language into the video prompt', () => {
    expect(buildVideoPrompt(creator, 'Küche', 'Das ist mein Morgenritual.')).toContain(
      'says in German: "Das ist mein Morgenritual."',
    );
    expect(buildVideoPrompt(creator, 'Küche', null)).toContain('does not speak');
  });

  it.each([
    [null, 8],
    [5, 4],
    [7, 6],
    [30, 8],
    [1, 4],
  ])('moves a requested %s seconds to the allowed %s', (requested, expected) => {
    expect(normalizeVideoDuration(requested)).toBe(expected);
  });

  it('prices a clip by the second, with and without sound', () => {
    expect(estimateVideoCostUsd(8, true)).toBe(1.2);
    expect(estimateVideoCostUsd(4, false)).toBe(0.4);
  });
});

describe('generateImage', () => {
  it('submits, polls until completed and downloads the picture', async () => {
    let polls = 0;
    const { fetchImplementation, calls } = routeFetch([
      ['https://treg.to/call/reapi.image-gen', () => json({ id: 'task_1', status: 'processing' }, { 'x-treg-cost-micro': '30000' })],
      [
        'https://treg.to/call/reapi.tasks.get',
        () => {
          polls += 1;

          return polls < 2
            ? json({ id: 'task_1', status: 'processing', output: null })
            : json({ id: 'task_1', status: 'completed', output: { image_urls: ['https://cdn.example/a.png'] } });
        },
      ],
      ['https://cdn.example/a.png', () => new Response(new Uint8Array([1, 2, 3]), { headers: { 'content-type': 'image/png' } })],
    ]);

    const media = await generateImage({
      credentials,
      fetchImplementation,
      sleep: noSleep,
      prompt: 'Portrait',
    });

    expect(media).toMatchObject({ mimeType: 'image/png', extension: 'png', costUsd: 0.03 });
    expect(Array.from(media.bytes)).toEqual([1, 2, 3]);
    expect(JSON.parse(String(calls[0]?.init?.body))).toMatchObject({ model: 'gemini-3-pro-image-preview', size: '9:16' });
    expect(polls).toBe(2);
  });

  it('reports a failed task with its reason', async () => {
    const { fetchImplementation } = routeFetch([
      ['https://treg.to/call/reapi.image-gen', () => json({ id: 'task_2' })],
      ['https://treg.to/call/reapi.tasks.get', () => json({ status: 'failed', error: { message: 'content policy' } })],
    ]);

    await expect(
      generateImage({ credentials, fetchImplementation, sleep: noSleep, prompt: 'x' }),
    ).rejects.toThrow('content policy');
  });
});

describe('generateVoice', () => {
  it('decodes the inline wav and keeps the cost', async () => {
    const wavBase64 = Buffer.from('RIFFdemo').toString('base64');
    const { fetchImplementation, calls } = routeFetch([
      [
        'https://treg.to/call/google-ai.voice-gen',
        () =>
          json(
            { candidates: [{ content: { parts: [{ inlineData: { mimeType: 'audio/wav', data: wavBase64 } }] }, finishReason: 'STOP' }] },
            { 'x-treg-cost-micro': '843' },
          ),
      ],
    ]);

    const media = await generateVoice({ credentials, fetchImplementation, text: 'Hallo zusammen', voiceName: null });

    expect(Buffer.from(media.bytes).toString()).toBe('RIFFdemo');
    expect(media).toMatchObject({ mimeType: 'audio/wav', extension: 'wav', costUsd: 0.000843 });
    expect(new URL(calls[0]?.url ?? '').searchParams.get('model')).toBe('gemini-3.8-flash-tts');
    expect(JSON.parse(String(calls[0]?.init?.body)).generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName).toBe('Kore');
  });

  it('fails clearly when no audio comes back', async () => {
    const { fetchImplementation } = routeFetch([
      ['https://treg.to/call/google-ai.voice-gen', () => json({ candidates: [{ finishReason: 'SAFETY' }] })],
    ]);

    await expect(
      generateVoice({ credentials, fetchImplementation, text: 'x', voiceName: 'Puck' }),
    ).rejects.toThrow('returned no audio');
  });
});

describe('generateVideo', () => {
  it('submits with a price cap from the duration and downloads the mp4', async () => {
    const { fetchImplementation, calls } = routeFetch([
      ['https://treg.to/call/replicate.video-gen', () => json({ id: 'pred_1' }, { 'x-treg-cost-micro': '1200000' })],
      ['https://treg.to/call/replicate.predictions.get', () => json({ status: 'succeeded', output: 'https://cdn.example/v.mp4' })],
      ['https://cdn.example/v.mp4', () => new Response(new Uint8Array([9, 9]), { headers: { 'content-type': 'video/mp4' } })],
    ]);

    const media = await generateVideo({
      credentials,
      fetchImplementation,
      sleep: noSleep,
      prompt: 'Scene',
      durationSeconds: 8,
    });

    expect(media).toMatchObject({ extension: 'mp4', costUsd: 1.2, endpointId: 'replicate.video-gen.veo-3.1-fast' });
    const headers = new Headers(calls[0]?.init?.headers);

    expect(headers.get('x-treg-route-max-cost')).toBe('1.25');
    expect(JSON.parse(String(calls[0]?.init?.body)).input).toMatchObject({ duration: 8, generate_audio: true, aspect_ratio: '9:16' });
  });

  it('accepts an output list and reports a canceled prediction', async () => {
    const ok = routeFetch([
      ['https://treg.to/call/replicate.video-gen', () => json({ id: 'p' })],
      ['https://treg.to/call/replicate.predictions.get', () => json({ status: 'succeeded', output: ['https://cdn.example/v.mp4'] })],
      ['https://cdn.example/v.mp4', () => new Response(new Uint8Array([1]), { headers: { 'content-type': 'video/mp4' } })],
    ]);
    const canceled = routeFetch([
      ['https://treg.to/call/replicate.video-gen', () => json({ id: 'p' })],
      ['https://treg.to/call/replicate.predictions.get', () => json({ status: 'canceled' })],
    ]);

    await expect(
      generateVideo({ credentials, fetchImplementation: ok.fetchImplementation, sleep: noSleep, prompt: 'x', durationSeconds: 4 }),
    ).resolves.toMatchObject({ extension: 'mp4' });
    await expect(
      generateVideo({ credentials, fetchImplementation: canceled.fetchImplementation, sleep: noSleep, prompt: 'x', durationSeconds: 4 }),
    ).rejects.toThrow('could not be generated');
  });
});
