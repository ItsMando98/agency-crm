import { defineObject, FieldType } from 'twenty-sdk/define';

import { CREATOR_STATUS } from 'src/constants/creator-studio.const';
import { buildSelectOptions } from 'src/utils/build-select-options';

export const UGC_CREATOR_UNIVERSAL_IDENTIFIER = '623cd698-037a-45a2-ac83-4bee84dcce9c';

export const UGC_CREATOR_NAME_FIELD_UNIVERSAL_IDENTIFIER = 'b38c005e-70f2-43d6-a1f1-68d771695bf2';
export const UGC_CREATOR_STATUS_FIELD_UNIVERSAL_IDENTIFIER = '5734144d-9344-44c7-8f58-77d80078da7e';
export const UGC_CREATOR_HANDLE_FIELD_UNIVERSAL_IDENTIFIER = '32625470-da7d-40c5-9367-c28c2ad9e8ed';
export const UGC_CREATOR_NICHE_FIELD_UNIVERSAL_IDENTIFIER = '35b284f3-bed4-40f0-9333-3ce2ddb464bd';
export const UGC_CREATOR_LANGUAGE_FIELD_UNIVERSAL_IDENTIFIER = 'e162ea88-8028-45a3-a39a-b8c9766678fe';
export const UGC_CREATOR_AVATAR_FIELD_UNIVERSAL_IDENTIFIER = '459cbb2e-d9ae-4ab3-86e2-e6078f1753af';

export default defineObject({
  universalIdentifier: UGC_CREATOR_UNIVERSAL_IDENTIFIER,
  nameSingular: 'ugcCreator',
  namePlural: 'ugcCreators',
  labelSingular: 'UGC creator',
  labelPlural: 'UGC creators',
  description: 'An AI creator profile: persona, look and voice for UGC content',
  icon: 'IconUserStar',
  labelIdentifierFieldMetadataUniversalIdentifier: UGC_CREATOR_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: UGC_CREATOR_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: UGC_CREATOR_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconProgress',
      defaultValue: `'${CREATOR_STATUS.DRAFT}'`,
      options: buildSelectOptions([
        { id: '39d6f74d-d7dc-4f62-94a4-6a8402a3153b', value: CREATOR_STATUS.DRAFT, label: 'Draft', color: 'gray' },
        { id: 'd8754d2c-dcf4-485d-b0ee-e154cce3c7be', value: CREATOR_STATUS.ACTIVE, label: 'Active', color: 'green' },
        { id: '1873ae89-ae99-422f-b41f-ab54fe3ac569', value: CREATOR_STATUS.ARCHIVED, label: 'Archived', color: 'orange' },
      ]),
    },
    {
      universalIdentifier: UGC_CREATOR_HANDLE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'handle',
      label: 'Handle',
      description: 'Account name used when posting',
      icon: 'IconAt',
      isNullable: true,
    },
    {
      universalIdentifier: '94777efc-accc-4c9b-ad61-53affa662b5a',
      type: FieldType.TEXT,
      name: 'persona',
      label: 'Persona',
      description: 'Who this creator is: age, job, life situation, character',
      icon: 'IconUser',
      isNullable: true,
    },
    {
      universalIdentifier: UGC_CREATOR_NICHE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'niche',
      label: 'Niche',
      description: 'Topic area the creator talks about',
      icon: 'IconTarget',
      isNullable: true,
    },
    {
      universalIdentifier: UGC_CREATOR_LANGUAGE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'language',
      label: 'Language',
      icon: 'IconLanguage',
      defaultValue: `'DE'`,
      options: buildSelectOptions([
        { id: 'e2aec2c1-207d-4741-8d98-ef294e7e6deb', value: 'DE', label: 'German', color: 'yellow' },
        { id: 'b2e2ea00-cb2a-494b-ac51-983c1bc76727', value: 'EN', label: 'English', color: 'blue' },
      ]),
    },
    {
      universalIdentifier: '9e4fc322-5ae8-4d60-ba7b-e9ef9b8c418f',
      type: FieldType.TEXT,
      name: 'tone',
      label: 'Tone of voice',
      icon: 'IconMessageCircle',
      isNullable: true,
    },
    {
      universalIdentifier: '06d71b79-0ee7-4663-9824-0ff4aaca4428',
      type: FieldType.TEXT,
      name: 'targetAudience',
      label: 'Target audience',
      icon: 'IconUsers',
      isNullable: true,
    },
    {
      universalIdentifier: '3c19fa08-aa49-44d2-8f3d-09568c091033',
      type: FieldType.TEXT,
      name: 'appearancePrompt',
      label: 'Appearance',
      description: 'Look of the creator, written the way an image model reads it',
      icon: 'IconEye',
      isNullable: true,
    },
    {
      universalIdentifier: 'e80a852b-5f17-4128-9c74-e103c24a54b8',
      type: FieldType.TEXT,
      name: 'voiceName',
      label: 'Voice',
      description: 'Name of the voice, for example Kore or Puck',
      icon: 'IconMicrophone',
      isNullable: true,
    },
    {
      universalIdentifier: 'bef5c3cf-0709-48c3-a167-2c1bf48716a3',
      type: FieldType.TEXT,
      name: 'rules',
      label: 'Rules',
      description: 'What the creator must and must not say or show',
      icon: 'IconListCheck',
      isNullable: true,
    },
    {
      universalIdentifier: '03cd732f-15eb-4459-830a-867e1165e874',
      type: FieldType.TEXT,
      name: 'disclosureLabel',
      label: 'AI disclosure',
      description: 'Label that marks the content as AI generated when it is published',
      icon: 'IconTag',
      defaultValue: `'Mit KI erstellt'`,
      isNullable: true,
    },
    {
      universalIdentifier: UGC_CREATOR_AVATAR_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.FILES,
      name: 'avatar',
      label: 'Avatar',
      icon: 'IconPhoto',
      universalSettings: { maxNumberOfValues: 1 },
    },
  ],
});
