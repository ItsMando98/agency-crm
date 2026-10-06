type KeywordFixture = {
  keyword: string;
  position: number;
  volume: number;
  url?: string;
  etv?: number;
  type?: string;
};

export const buildRankedKeywordsResult = (keywords: KeywordFixture[]) => ({
  total_count: keywords.length,
  items_count: keywords.length,
  metrics: {
    organic: {
      pos_1: keywords.filter((keyword) => keyword.position === 1).length,
      pos_2_3: keywords.filter((keyword) => keyword.position >= 2 && keyword.position <= 3).length,
      pos_4_10: keywords.filter((keyword) => keyword.position >= 4 && keyword.position <= 10).length,
      pos_11_20: keywords.filter((keyword) => keyword.position >= 11 && keyword.position <= 20).length,
      count: keywords.length,
      etv: keywords.reduce((sum, keyword) => sum + (keyword.etv ?? 0), 0),
    },
  },
  items: keywords.map((keyword) => ({
    keyword_data: {
      keyword: keyword.keyword,
      keyword_info: { search_volume: keyword.volume },
    },
    ranked_serp_element: {
      serp_item: {
        type: keyword.type ?? 'organic',
        rank_group: keyword.position,
        rank_absolute: keyword.position,
        url: keyword.url ?? 'https://example.com/',
        etv: keyword.etv ?? 0,
      },
    },
  })),
});
