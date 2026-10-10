import { type CreatorProfile } from 'src/types/creator-profile';

const LANGUAGE_NAME = { DE: 'German', EN: 'English' } as const;

const describeCreator = (creator: CreatorProfile): string =>
  [
    creator.appearancePrompt === null ? null : `Appearance: ${creator.appearancePrompt}`,
    creator.persona === null ? null : `Character: ${creator.persona}`,
    creator.niche === null ? null : `Topic area: ${creator.niche}`,
  ]
    .filter((part): part is string => part !== null)
    .join('. ');

const rulesSuffix = (creator: CreatorProfile): string =>
  creator.rules === null ? '' : ` Rules to respect: ${creator.rules}`;

export const buildImagePrompt = (creator: CreatorProfile, scene: string): string =>
  `Authentic user generated content photo shot on a smartphone, natural light, unretouched, not a studio look. ${describeCreator(creator)}. Scene: ${scene}. No text overlays, no logos, no watermarks.${rulesSuffix(creator)}`;

export const buildVideoPrompt = (
  creator: CreatorProfile,
  scene: string,
  script: string | null,
): string => {
  const speech =
    script === null || script.trim() === ''
      ? 'The person does not speak.'
      : `The person looks into the camera and says in ${LANGUAGE_NAME[creator.language]}: "${script.trim()}"`;

  return `Vertical smartphone video in an authentic user generated content style, natural light, handheld. ${describeCreator(creator)}. Scene: ${scene}. ${speech} No text overlays, no logos.${rulesSuffix(creator)}`;
};
