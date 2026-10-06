import { ROBOTS_USER_AGENT_TOKEN } from 'src/constants/crawl.const';

type RobotsRules = {
  allowRules: string[];
  disallowRules: string[];
  sitemapUrls: string[];
};

type RobotsGroup = {
  agents: string[];
  allowRules: string[];
  disallowRules: string[];
};

export const parseRobotsRules = (robotsTxt: string): RobotsRules => {
  const groups: RobotsGroup[] = [];
  const sitemapUrls: string[] = [];
  let currentGroup: RobotsGroup | null = null;
  let lastDirectiveWasAgent = false;

  for (const rawLine of robotsTxt.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    const separatorIndex = line.indexOf(':');

    if (separatorIndex === -1) {
      continue;
    }

    const directive = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1).trim();

    if (directive === 'sitemap') {
      sitemapUrls.push(value);
      continue;
    }

    if (directive === 'user-agent') {
      if (currentGroup === null || !lastDirectiveWasAgent) {
        currentGroup = { agents: [], allowRules: [], disallowRules: [] };
        groups.push(currentGroup);
      }

      currentGroup.agents.push(value.toLowerCase());
      lastDirectiveWasAgent = true;
      continue;
    }

    lastDirectiveWasAgent = false;

    if (currentGroup === null || value === '') {
      continue;
    }

    if (directive === 'allow') {
      currentGroup.allowRules.push(value);
    } else if (directive === 'disallow') {
      currentGroup.disallowRules.push(value);
    }
  }

  const selectedGroup =
    groups.find((group) => group.agents.includes(ROBOTS_USER_AGENT_TOKEN)) ??
    groups.find((group) => group.agents.includes('*'));

  return {
    allowRules: selectedGroup?.allowRules ?? [],
    disallowRules: selectedGroup?.disallowRules ?? [],
    sitemapUrls,
  };
};
