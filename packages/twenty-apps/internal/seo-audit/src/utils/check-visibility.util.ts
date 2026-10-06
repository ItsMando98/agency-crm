import { VISIBILITY_DETAIL_LABELS } from 'src/constants/visibility-detail-labels.const';
import { KEYWORD_CATEGORY } from 'src/constants/seo-audit.constants';
import {
  NEAR_PAGE_ONE_MIN_SEARCH_VOLUME,
  QUICK_WIN_MIN_SEARCH_VOLUME,
} from 'src/constants/seo-thresholds.const';
import { type AuditLanguage } from 'src/types/audit-language';
import { type BacklinkTarget } from 'src/types/backlink-target';
import { type Finding } from 'src/types/finding';
import { type KeywordCategory } from 'src/types/keyword-category';
import { type MarketData } from 'src/types/market-data';
import { type ScoredKeyword } from 'src/types/scored-keyword';

type CheckVisibilityParams = {
  marketData: MarketData | null;
  keywords: ScoredKeyword[];
  brokenBacklinkTargets: BacklinkTarget[];
  language: AuditLanguage;
};

const MAX_DETAILS = 5;

export const checkVisibility = ({
  marketData,
  keywords,
  brokenBacklinkTargets,
  language,
}: CheckVisibilityParams): Finding[] => {
  const labels = VISIBILITY_DETAIL_LABELS[language];
  const findings: Finding[] = [];

  if (marketData?.rankings?.totalKeywords === 0) {
    findings.push({ ruleId: 'NO_RANKINGS', affectedUrls: [] });
  }

  const buildKeywordFinding = (
    ruleId: 'KEYWORD_QUICK_WINS' | 'KEYWORD_NEAR_PAGE_ONE',
    category: KeywordCategory,
    minSearchVolume: number,
  ): Finding[] => {
    const matching = keywords
      .filter(
        (keyword) =>
          keyword.category === category && keyword.searchVolume >= minSearchVolume,
      )
      .sort((first, second) => second.searchVolume - first.searchVolume);

    if (matching.length === 0) {
      return [];
    }

    return [
      {
        ruleId,
        affectedUrls: [
          ...new Set(
            matching
              .map((keyword) => keyword.url)
              .filter((url): url is string => url !== null),
          ),
        ],
        details: matching
          .slice(0, MAX_DETAILS)
          .map((keyword) =>
            labels.keyword(keyword.keyword, keyword.position, keyword.searchVolume),
          ),
        count: matching.length,
      },
    ];
  };

  findings.push(
    ...buildKeywordFinding(
      'KEYWORD_QUICK_WINS',
      KEYWORD_CATEGORY.QUICK_WIN,
      QUICK_WIN_MIN_SEARCH_VOLUME,
    ),
    ...buildKeywordFinding(
      'KEYWORD_NEAR_PAGE_ONE',
      KEYWORD_CATEGORY.NEAR_PAGE_ONE,
      NEAR_PAGE_ONE_MIN_SEARCH_VOLUME,
    ),
  );

  if (brokenBacklinkTargets.length > 0) {
    findings.push({
      ruleId: 'BACKLINKS_TO_BROKEN_PAGES',
      affectedUrls: brokenBacklinkTargets.map((target) => target.url),
      details: brokenBacklinkTargets
        .slice(0, MAX_DETAILS)
        .map((target) =>
          labels.backlinkTarget(target.url, target.backlinks, target.referringDomains),
        ),
    });
  }

  return findings;
};
