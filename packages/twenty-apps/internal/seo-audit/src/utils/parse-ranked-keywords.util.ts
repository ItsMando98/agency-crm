import { type RankedKeyword } from 'src/types/ranked-keyword';
import { type RankingsSummary } from 'src/types/rankings-summary';
import { asFiniteNumber } from 'src/utils/as-finite-number.util';
import { asRecord } from 'src/utils/as-record.util';

const parseItem = (item: unknown): RankedKeyword | null => {
  const keywordData = asRecord(asRecord(item)?.keyword_data);
  const serpItem = asRecord(asRecord(asRecord(item)?.ranked_serp_element)?.serp_item);
  const keyword = keywordData?.keyword;
  const position =
    asFiniteNumber(serpItem?.rank_group) ?? asFiniteNumber(serpItem?.rank_absolute);

  if (typeof keyword !== 'string' || keyword === '' || position === null) {
    return null;
  }

  if (typeof serpItem?.type === 'string' && serpItem.type !== 'organic') {
    return null;
  }

  return {
    keyword,
    position,
    searchVolume:
      asFiniteNumber(asRecord(keywordData?.keyword_info)?.search_volume) ?? 0,
    estimatedTraffic: asFiniteNumber(serpItem?.etv) ?? 0,
    url: typeof serpItem?.url === 'string' ? serpItem.url : null,
  };
};

export const parseRankedKeywords = (result: unknown): RankingsSummary | null => {
  const record = asRecord(result);

  if (record === null) {
    return null;
  }

  const keywords = (Array.isArray(record.items) ? record.items : [])
    .map(parseItem)
    .filter((keyword): keyword is RankedKeyword => keyword !== null);
  const organic = asRecord(asRecord(record.metrics)?.organic);
  const countFromMetrics = asFiniteNumber(organic?.count);
  const positionCounts =
    organic === null
      ? null
      : {
          position1: asFiniteNumber(organic.pos_1) ?? 0,
          positions2To3: asFiniteNumber(organic.pos_2_3) ?? 0,
          positions4To10: asFiniteNumber(organic.pos_4_10) ?? 0,
          positions11To20: asFiniteNumber(organic.pos_11_20) ?? 0,
        };

  return {
    totalKeywords:
      countFromMetrics ?? asFiniteNumber(record.total_count) ?? keywords.length,
    estimatedMonthlyTraffic:
      asFiniteNumber(organic?.etv) ??
      keywords.reduce((sum, keyword) => sum + keyword.estimatedTraffic, 0),
    positionCounts,
    keywords,
  };
};
