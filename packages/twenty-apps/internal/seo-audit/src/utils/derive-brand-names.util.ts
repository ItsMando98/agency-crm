import { AI_MIN_BRAND_NAME_LENGTH } from 'src/constants/ai-visibility.const';
import { getSourceHost } from 'src/utils/get-source-host.util';

// Second level labels of country style domains such as example.co.uk.
const GENERIC_SECOND_LEVEL_LABELS = ['co', 'com', 'org', 'net', 'gov', 'ac'];
const MIN_LABELS_FOR_SUBDOMAIN = 3;

// Page titles are left out on purpose: a short common word in a title would
// match almost every answer and inflate how often the site seems to be named.
export const deriveBrandNames = (origin: string): string[] => {
  const host = getSourceHost(origin);

  if (host === null) {
    return [];
  }

  const labels = host.split('.');
  const secondLevelLabel = labels[labels.length - 2];
  const brandLabel =
    labels.length >= MIN_LABELS_FOR_SUBDOMAIN &&
    GENERIC_SECOND_LEVEL_LABELS.includes(secondLevelLabel)
      ? labels[labels.length - 3]
      : secondLevelLabel;

  if (brandLabel === undefined || brandLabel.length < AI_MIN_BRAND_NAME_LENGTH) {
    return [];
  }

  return [...new Set([brandLabel, brandLabel.replace(/-/g, ' ')])];
};
