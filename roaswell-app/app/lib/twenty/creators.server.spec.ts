import { describe, expect, it, vi } from 'vitest';

import { type Principal } from '~/lib/auth/principal';
import { estimateAssetCostUsd, formatUsd } from '~/lib/twenty/asset-cost';
import {
  createCreator,
  listCreatorAssets,
  listCreators,
  nearestVideoDuration,
  requestAsset,
} from '~/lib/twenty/creators.server';
import { type TwentyClient } from '~/lib/twenty/twenty-client.server';

const team: Principal = { kind: 'TEAM', email: 'team@roaswell.com' };
const client: Principal = { kind: 'CLIENT', email: 'kunde@firma.de', companyId: 'company-1' };
const emptyPage = { records: [], totalCount: 0, endCursor: null, hasNextPage: false };

const buildClient = (overrides: Partial<TwentyClient> = {}): TwentyClient => ({
  findMany: vi.fn(async () => emptyPage),
  findOne: vi.fn(async () => null),
  create: vi.fn(async () => null),
  update: vi.fn(async () => null),
  ...overrides,
});

const creatorRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 'creator-1',
  name: 'Mara',
  status: 'ACTIVE',
  companyId: 'company-1',
  ...overrides,
});

describe('creators data layer', () => {
  it('limits a client to the creators of their company', async () => {
    const findMany = vi.fn(async () => emptyPage);

    await listCreators(buildClient({ findMany }), client);
    await listCreators(buildClient({ findMany }), team);

    expect(findMany).toHaveBeenNthCalledWith(1, expect.objectContaining({ filter: 'and(companyId[eq]:"company-1")' }));
    expect(findMany).toHaveBeenNthCalledWith(2, expect.objectContaining({ filter: undefined }));
  });

  it('hides the assets of a creator of another company', async () => {
    const findMany = vi.fn(async () => emptyPage);
    const findOne = vi.fn(async () => creatorRecord({ companyId: 'company-2' }));

    expect(await listCreatorAssets(buildClient({ findMany, findOne }), client, 'creator-1')).toEqual([]);
    expect(findMany).not.toHaveBeenCalled();
  });

  it('reads the file url of a finished asset', async () => {
    const findOne = vi.fn(async () => creatorRecord());
    const findMany = vi.fn(async () => ({
      ...emptyPage,
      records: [
        { id: 'a1', assetType: 'IMAGE', status: 'DONE', costUsd: 0.03, creatorId: 'creator-1', file: [{ fileId: 'f1', url: 'https://crm/file/f1' }] },
        { id: 'a2', assetType: 'VIDEO', status: 'RUNNING', creatorId: 'creator-1' },
      ],
    }));

    const assets = await listCreatorAssets(buildClient({ findMany, findOne }), team, 'creator-1');

    expect(assets.map((asset) => [asset.id, asset.fileUrl, asset.status])).toEqual([
      ['a1', 'https://crm/file/f1', 'DONE'],
      ['a2', null, 'RUNNING'],
    ]);
  });

  it('only lets the team create a creator and requires a name', async () => {
    const create = vi.fn(async () => ({ id: 'new' }));
    const twenty = buildClient({ create });

    expect(await createCreator(twenty, client, { name: 'Mara' })).toBeNull();
    expect(await createCreator(twenty, team, { name: '  ' })).toBeNull();
    expect(await createCreator(twenty, team, { name: ' Mara ', persona: 'Coach', language: 'DE' })).toEqual({ id: 'new' });
    expect(create).toHaveBeenCalledWith({
      object: 'ugcCreators',
      singular: 'ugcCreator',
      data: { status: 'DRAFT', name: 'Mara', persona: 'Coach', language: 'DE' },
    });
  });
});

describe('requestAsset', () => {
  const twenty = (create = vi.fn(async () => ({ id: 'asset-1' }))) =>
    buildClient({ create, findOne: vi.fn(async () => creatorRecord()) });

  it('queues an image order for the creator', async () => {
    const create = vi.fn(async () => ({ id: 'asset-1' }));

    const result = await requestAsset(twenty(create), team, 'creator-1', { type: 'IMAGE', prompt: 'Im Park' });

    expect(result).toEqual({ status: 'QUEUED', id: 'asset-1' });
    expect(create).toHaveBeenCalledWith({
      object: 'ugcAssets',
      singular: 'ugcAsset',
      data: { name: 'IMAGE Mara', assetType: 'IMAGE', status: 'QUEUED', creatorId: 'creator-1', prompt: 'Im Park' },
    });
  });

  it('moves the video length to an allowed value', async () => {
    const create = vi.fn(async () => ({ id: 'asset-2' }));

    await requestAsset(twenty(create), team, 'creator-1', {
      type: 'VIDEO',
      prompt: 'Küche',
      script: 'Hallo',
      durationSeconds: 5,
      platform: 'TIKTOK',
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ durationSeconds: 4, platform: 'TIKTOK', script: 'Hallo' }),
      }),
    );
  });

  it.each([
    [{ type: 'VOICE' as const }, 'Text'],
    [{ type: 'VIDEO' as const }, 'Szene'],
  ])('refuses an incomplete order %j', async (request, hint) => {
    const create = vi.fn();
    const result = await requestAsset(twenty(create), team, 'creator-1', request);

    expect(result.status).toBe('INVALID');
    expect(JSON.stringify(result)).toContain(hint);
    expect(create).not.toHaveBeenCalled();
  });

  it('refuses a client and never creates anything', async () => {
    const create = vi.fn();

    expect(await requestAsset(twenty(create), client, 'creator-1', { type: 'IMAGE' })).toEqual({ status: 'FORBIDDEN' });
    expect(create).not.toHaveBeenCalled();
  });
});

describe('cost helpers', () => {
  it('picks the nearest allowed length and prices the order', () => {
    expect(nearestVideoDuration(7)).toBe(6);
    expect(nearestVideoDuration(null)).toBe(8);
    expect(estimateAssetCostUsd('VIDEO', 8)).toBe(1.2);
    expect(estimateAssetCostUsd('IMAGE')).toBe(0.03);
    expect(formatUsd(0.0009)).toBe('0,001 USD');
    expect(formatUsd(1.2)).toBe('1,20 USD');
    expect(formatUsd(null)).toBe('-');
  });
});
