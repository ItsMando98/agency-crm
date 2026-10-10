import { type Principal } from '~/lib/auth/principal';
import {
  type Asset,
  type AssetPlatform,
  type AssetType,
  type Creator,
  ASSET_PLATFORMS,
  ASSET_TYPES,
  VIDEO_DURATIONS_SECONDS,
  assetSchema,
  creatorSchema,
} from '~/lib/twenty/creator-types';
import { buildFilter } from '~/lib/twenty/build-filter';
import { type TwentyClient } from '~/lib/twenty/twenty-client.server';

const LIST_LIMIT = 100;
const ASSET_LIMIT = 60;

type Condition = Parameters<typeof buildFilter>[0][number];

const scopeConditions = (principal: Principal): Condition[] =>
  principal.kind === 'CLIENT'
    ? [{ field: 'companyId', comparator: 'eq', value: principal.companyId }]
    : [];

const canSee = (principal: Principal, creator: Pick<Creator, 'companyId'>): boolean =>
  principal.kind === 'TEAM' || creator.companyId === principal.companyId;

const idOf = (value: unknown): string | null => {
  const id = (value as { id?: unknown } | null)?.id;

  return typeof id === 'string' ? id : null;
};

export const nearestVideoDuration = (requested: number | null): number => {
  const target = requested ?? VIDEO_DURATIONS_SECONDS[VIDEO_DURATIONS_SECONDS.length - 1] ?? 8;

  return VIDEO_DURATIONS_SECONDS.reduce((nearest, candidate) =>
    Math.abs(candidate - target) < Math.abs(nearest - target) ? candidate : nearest,
  );
};

export const listCreators = async (
  client: TwentyClient,
  principal: Principal,
): Promise<Creator[]> => {
  const result = await client.findMany({
    object: 'ugcCreators',
    filter: buildFilter(scopeConditions(principal)),
    orderBy: 'createdAt[DescNullsLast]',
    limit: LIST_LIMIT,
  });

  return result.records.flatMap((record) => {
    const parsed = creatorSchema.safeParse(record);

    return parsed.success ? [parsed.data] : [];
  });
};

export const getCreator = async (
  client: TwentyClient,
  principal: Principal,
  creatorId: string,
): Promise<Creator | null> => {
  const record = await client.findOne({ object: 'ugcCreators', singular: 'ugcCreator', id: creatorId });
  const parsed = creatorSchema.safeParse(record);

  return parsed.success && canSee(principal, parsed.data) ? parsed.data : null;
};

export type CreatorInput = {
  name: string;
  handle?: string;
  persona?: string;
  niche?: string;
  language?: 'DE' | 'EN';
  tone?: string;
  targetAudience?: string;
  appearancePrompt?: string;
  voiceName?: string;
  rules?: string;
  disclosureLabel?: string;
  companyId?: string;
};

const cleanInput = (input: Partial<CreatorInput>): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(input)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]),
  );

export const createCreator = async (
  client: TwentyClient,
  principal: Principal,
  input: CreatorInput,
): Promise<{ id: string } | null> => {
  if (principal.kind === 'CLIENT' || input.name.trim() === '') {
    return null;
  }

  const created = await client.create({
    object: 'ugcCreators',
    singular: 'ugcCreator',
    data: { status: 'DRAFT', ...cleanInput(input) },
  });
  const id = idOf(created);

  return id === null ? null : { id };
};

export const updateCreator = async (
  client: TwentyClient,
  principal: Principal,
  creatorId: string,
  input: Partial<CreatorInput> & { status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' },
): Promise<boolean> => {
  if (principal.kind === 'CLIENT') {
    return false;
  }

  const updated = await client.update({
    object: 'ugcCreators',
    singular: 'ugcCreator',
    id: creatorId,
    data: cleanInput(input),
  });

  return updated !== null;
};

export const listCreatorAssets = async (
  client: TwentyClient,
  principal: Principal,
  creatorId: string,
): Promise<Asset[]> => {
  if ((await getCreator(client, principal, creatorId)) === null) {
    return [];
  }

  const result = await client.findMany({
    object: 'ugcAssets',
    filter: buildFilter([{ field: 'creatorId', comparator: 'eq', value: creatorId }]),
    orderBy: 'createdAt[DescNullsLast]',
    limit: ASSET_LIMIT,
  });

  return result.records.flatMap((record) => {
    const parsed = assetSchema.safeParse(record);

    return parsed.success ? [parsed.data] : [];
  });
};

export type AssetRequest = {
  type: AssetType;
  prompt?: string;
  script?: string;
  durationSeconds?: number;
  platform?: AssetPlatform;
};

export type AssetRequestResult =
  | { status: 'QUEUED'; id: string }
  | { status: 'INVALID'; message: string }
  | { status: 'FORBIDDEN' };

// Creating the record is the whole request: the Creator Studio app in Twenty
// reacts to the new record and does the generation.
export const requestAsset = async (
  client: TwentyClient,
  principal: Principal,
  creatorId: string,
  request: AssetRequest,
): Promise<AssetRequestResult> => {
  if (principal.kind === 'CLIENT') {
    return { status: 'FORBIDDEN' };
  }

  const creator = await getCreator(client, principal, creatorId);

  if (creator === null) {
    return { status: 'INVALID', message: 'Das Profil wurde nicht gefunden.' };
  }

  if (!ASSET_TYPES.includes(request.type)) {
    return { status: 'INVALID', message: 'Unbekannter Typ.' };
  }

  const prompt = request.prompt?.trim() ?? '';
  const script = request.script?.trim() ?? '';

  if (request.type === 'VOICE' && script === '') {
    return { status: 'INVALID', message: 'Für die Stimme brauchst du einen Text.' };
  }

  if (request.type === 'VIDEO' && prompt === '' && script === '') {
    return { status: 'INVALID', message: 'Beschreibe die Szene oder gib einen Text vor.' };
  }

  if (request.platform !== undefined && !ASSET_PLATFORMS.includes(request.platform)) {
    return { status: 'INVALID', message: 'Unbekannte Plattform.' };
  }

  const created = await client.create({
    object: 'ugcAssets',
    singular: 'ugcAsset',
    data: {
      name: `${request.type} ${creator.name ?? 'Creator'}`,
      assetType: request.type,
      status: 'QUEUED',
      creatorId,
      ...(prompt === '' ? {} : { prompt }),
      ...(script === '' ? {} : { script }),
      ...(request.platform === undefined ? {} : { platform: request.platform }),
      ...(request.type === 'VIDEO'
        ? { durationSeconds: nearestVideoDuration(request.durationSeconds ?? null) }
        : {}),
    },
  });
  const id = idOf(created);

  return id === null
    ? { status: 'INVALID', message: 'Der Auftrag konnte nicht angelegt werden.' }
    : { status: 'QUEUED', id };
};
