import { defineObject, FieldType } from 'twenty-sdk/define';

import { ASSET_STATUS, ASSET_TYPE } from 'src/constants/creator-studio.const';
import { buildSelectOptions } from 'src/utils/build-select-options';

export const UGC_ASSET_UNIVERSAL_IDENTIFIER = 'd4926fd3-d868-4f97-b5e9-36a4f05aad0f';

export const UGC_ASSET_NAME_FIELD_UNIVERSAL_IDENTIFIER = '810e9893-7a29-4e3b-bd39-6261515aa192';
export const UGC_ASSET_TYPE_FIELD_UNIVERSAL_IDENTIFIER = '2402086d-b367-41c5-b2c1-b0f7097df68c';
export const UGC_ASSET_STATUS_FIELD_UNIVERSAL_IDENTIFIER = 'f07244a7-5273-4c17-bb01-18026d36656a';
export const UGC_ASSET_COST_FIELD_UNIVERSAL_IDENTIFIER = '1b31ee5f-dae7-4b05-a440-b1e3db7c3e2a';
export const UGC_ASSET_FILE_FIELD_UNIVERSAL_IDENTIFIER = 'b6fefa15-d661-45cb-ab20-0a75a7166784';
export const UGC_ASSET_FINISHED_AT_FIELD_UNIVERSAL_IDENTIFIER = '7f4711a4-f3f0-4c25-99d7-bed10186c160';

export default defineObject({
  universalIdentifier: UGC_ASSET_UNIVERSAL_IDENTIFIER,
  nameSingular: 'ugcAsset',
  namePlural: 'ugcAssets',
  labelSingular: 'UGC asset',
  labelPlural: 'UGC assets',
  description: 'A generated image, voice clip or short video of a creator',
  icon: 'IconPhotoVideo',
  labelIdentifierFieldMetadataUniversalIdentifier: UGC_ASSET_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: UGC_ASSET_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconAbc',
      isNullable: true,
    },
    {
      universalIdentifier: UGC_ASSET_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'type',
      label: 'Type',
      icon: 'IconCategory',
      defaultValue: `'${ASSET_TYPE.IMAGE}'`,
      options: buildSelectOptions([
        { id: '3e2fd77a-1644-4fd3-ba96-f1465f17ab02', value: ASSET_TYPE.IMAGE, label: 'Image', color: 'blue' },
        { id: '9c36ce86-11ee-4aa6-82ce-ff6133227e48', value: ASSET_TYPE.VOICE, label: 'Voice', color: 'purple' },
        { id: '3541d80a-1bc9-490f-ade5-8becfb7f8d1a', value: ASSET_TYPE.VIDEO, label: 'Video', color: 'pink' },
      ]),
    },
    {
      universalIdentifier: UGC_ASSET_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconProgress',
      defaultValue: `'${ASSET_STATUS.QUEUED}'`,
      options: buildSelectOptions([
        { id: 'f503a9f5-43a7-4eb1-8b1b-33e9af808097', value: ASSET_STATUS.QUEUED, label: 'Queued', color: 'blue' },
        { id: '68ac492c-4940-4a2f-995c-d4629d02d237', value: ASSET_STATUS.RUNNING, label: 'Running', color: 'purple' },
        { id: '55b6e73d-5220-4c96-ae4e-ddc95b19037a', value: ASSET_STATUS.DONE, label: 'Done', color: 'green' },
        { id: 'af8772c9-c277-4604-9eef-c899c9fd93a4', value: ASSET_STATUS.FAILED, label: 'Failed', color: 'red' },
      ]),
    },
    {
      universalIdentifier: 'cf9aa5a2-1fee-4a1b-8b70-fb2678782a70',
      type: FieldType.TEXT,
      name: 'prompt',
      label: 'Scene',
      description: 'What the picture or video shows',
      icon: 'IconPrompt',
      isNullable: true,
    },
    {
      universalIdentifier: '4ff8a19f-cb14-4f4f-b91d-dbf7b2b3c875',
      type: FieldType.TEXT,
      name: 'script',
      label: 'Script',
      description: 'The line the creator speaks',
      icon: 'IconFileText',
      isNullable: true,
    },
    {
      universalIdentifier: '1aa1a434-7ee6-424f-835e-17af9fc2f305',
      type: FieldType.SELECT,
      name: 'platform',
      label: 'Platform',
      icon: 'IconBrandTiktok',
      isNullable: true,
      options: buildSelectOptions([
        { id: '42540c47-2c05-4666-a998-ed3f4bda7a63', value: 'TIKTOK', label: 'TikTok', color: 'gray' },
        { id: '4342d23b-6c4d-436a-92e4-25849a29df15', value: 'REELS', label: 'Reels', color: 'pink' },
        { id: 'b13d1f83-fecc-4950-ae0f-c4c68c4f0eeb', value: 'SHORTS', label: 'Shorts', color: 'red' },
      ]),
    },
    {
      universalIdentifier: 'f03768f9-f1ec-4578-8fb9-eed0ed8520ff',
      type: FieldType.NUMBER,
      name: 'durationSeconds',
      label: 'Duration (seconds)',
      icon: 'IconClock',
      isNullable: true,
    },
    {
      universalIdentifier: '54397a4e-a1e3-4651-ab62-1179b661b70d',
      type: FieldType.TEXT,
      name: 'failureReason',
      label: 'Failure reason',
      icon: 'IconAlertTriangle',
      isNullable: true,
    },
    {
      universalIdentifier: UGC_ASSET_COST_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'costUsd',
      label: 'Cost (USD)',
      icon: 'IconCoin',
      isNullable: true,
    },
    {
      universalIdentifier: '2bb906d2-5b1c-4c24-aa4d-af6b8b1e5094',
      type: FieldType.TEXT,
      name: 'providerEndpoint',
      label: 'Provider endpoint',
      icon: 'IconPlug',
      isNullable: true,
    },
    {
      universalIdentifier: UGC_ASSET_FILE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.FILES,
      name: 'file',
      label: 'File',
      icon: 'IconFile',
      universalSettings: { maxNumberOfValues: 1 },
    },
    {
      universalIdentifier: '941adc3b-52e0-4c9a-95ce-523c922d7218',
      type: FieldType.DATE_TIME,
      name: 'startedAt',
      label: 'Started at',
      icon: 'IconPlayerPlay',
      isNullable: true,
    },
    {
      universalIdentifier: UGC_ASSET_FINISHED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'finishedAt',
      label: 'Finished at',
      icon: 'IconFlagCheck',
      isNullable: true,
    },
  ],
});
