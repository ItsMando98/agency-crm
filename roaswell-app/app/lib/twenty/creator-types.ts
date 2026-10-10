import { z } from 'zod';

const nullableString = z.string().nullish().transform((value) => value ?? null);
const nullableNumber = z.number().nullish().transform((value) => value ?? null);

export const CREATOR_STATUSES = ['DRAFT', 'ACTIVE', 'ARCHIVED'] as const;
export const ASSET_TYPES = ['IMAGE', 'VOICE', 'VIDEO'] as const;
export const ASSET_STATUSES = ['QUEUED', 'RUNNING', 'DONE', 'FAILED'] as const;
export const ASSET_PLATFORMS = ['TIKTOK', 'REELS', 'SHORTS'] as const;
export const VIDEO_DURATIONS_SECONDS = [4, 6, 8] as const;

export type CreatorStatus = (typeof CREATOR_STATUSES)[number];
export type AssetType = (typeof ASSET_TYPES)[number];
export type AssetStatus = (typeof ASSET_STATUSES)[number];
export type AssetPlatform = (typeof ASSET_PLATFORMS)[number];

const pick = <TValue extends string>(options: readonly TValue[], fallback: TValue) =>
  z
    .string()
    .nullish()
    .transform((value): TValue => options.find((option) => option === value) ?? fallback);

const firstFileUrl = (value: unknown): string | null => {
  const first: unknown = Array.isArray(value) ? value[0] : null;
  const url = (first as { url?: unknown } | null)?.url;

  return typeof url === 'string' && url !== '' ? url : null;
};

export const creatorSchema = z.object({
  id: z.string(),
  name: nullableString,
  status: pick(CREATOR_STATUSES, 'DRAFT'),
  handle: nullableString,
  persona: nullableString,
  niche: nullableString,
  language: pick(['DE', 'EN'] as const, 'DE'),
  tone: nullableString,
  targetAudience: nullableString,
  appearancePrompt: nullableString,
  voiceName: nullableString,
  rules: nullableString,
  disclosureLabel: nullableString,
  companyId: nullableString,
  createdAt: nullableString,
});

export type Creator = z.infer<typeof creatorSchema>;

export const assetSchema = z
  .object({
    id: z.string(),
    name: nullableString,
    // `type` is a reserved field name in Twenty, so the field is called assetType.
    assetType: pick(ASSET_TYPES, 'IMAGE'),
    status: pick(ASSET_STATUSES, 'QUEUED'),
    prompt: nullableString,
    script: nullableString,
    platform: nullableString,
    durationSeconds: nullableNumber,
    failureReason: nullableString,
    costUsd: nullableNumber,
    creatorId: nullableString,
    createdAt: nullableString,
    file: z.unknown().optional(),
  })
  .transform(({ file, assetType, ...asset }) => ({
    ...asset,
    type: assetType,
    fileUrl: firstFileUrl(file),
  }));

export type Asset = z.infer<typeof assetSchema>;
