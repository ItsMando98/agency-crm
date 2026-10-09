import {
  AI_IGNORED_SOURCE_DOMAINS,
  AI_MAX_COMPETITORS_SHOWN,
  AI_MIN_ANSWER_LENGTH,
  AI_MIN_BRAND_NAME_LENGTH,
} from 'src/constants/ai-visibility.const';
import { type AiAnswer, type AiAnswerStatus } from 'src/types/ai-visibility';
import { getSourceHost, isSameOrSubdomain } from 'src/utils/get-source-host.util';

type ClassifyAiAnswerParams = {
  answer: AiAnswer | null;
  ownDomain: string;
  brandNames: string[];
};

type ClassifiedAiAnswer = {
  status: AiAnswerStatus;
  competitorDomains: string[];
};

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Letters and digits on either side mean the name is part of a longer word.
const containsWholeName = (text: string, name: string): boolean =>
  new RegExp(
    `(?<![\\p{L}\\p{N}])${escapeRegExp(name)}(?![\\p{L}\\p{N}])`,
    'iu',
  ).test(text);

const findCompetitorDomains = (hosts: string[], ownDomain: string): string[] => {
  const counts = new Map<string, number>();

  hosts
    .filter(
      (host) =>
        !isSameOrSubdomain(host, ownDomain) &&
        !AI_IGNORED_SOURCE_DOMAINS.some((ignored) => isSameOrSubdomain(host, ignored)),
    )
    .forEach((host) => counts.set(host, (counts.get(host) ?? 0) + 1));

  return [...counts.entries()]
    .sort((first, second) => second[1] - first[1])
    .slice(0, AI_MAX_COMPETITORS_SHOWN)
    .map(([host]) => host);
};

export const classifyAiAnswer = ({
  answer,
  ownDomain,
  brandNames,
}: ClassifyAiAnswerParams): ClassifiedAiAnswer => {
  if (
    answer === null ||
    (answer.text.trim().length < AI_MIN_ANSWER_LENGTH && answer.sources.length === 0)
  ) {
    return { status: 'UNKNOWN', competitorDomains: [] };
  }

  const hosts = answer.sources
    .map((source) => getSourceHost(source.url))
    .filter((host): host is string => host !== null);
  const competitorDomains = findCompetitorDomains(hosts, ownDomain);

  if (hosts.some((host) => isSameOrSubdomain(host, ownDomain))) {
    return { status: 'CITED', competitorDomains };
  }

  const isMentioned =
    containsWholeName(answer.text, ownDomain) ||
    brandNames
      .filter((name) => name.length >= AI_MIN_BRAND_NAME_LENGTH)
      .some((name) => containsWholeName(answer.text, name));

  return { status: isMentioned ? 'MENTIONED' : 'ABSENT', competitorDomains };
};
