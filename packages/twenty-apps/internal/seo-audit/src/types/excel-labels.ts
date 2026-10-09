export type ExcelLabels = {
  sheets: {
    overview: string;
    actions: string;
    pages: string;
    keywords: string;
    backlinks: string;
    competitors: string;
    review: string;
  };
  overview: {
    domain: string;
    generatedOn: string;
    score: string;
    grade: string;
    pages: string;
    tasks: string;
    area: string;
    areaScore: string;
    band: string;
    mobilePerformanceScore: string;
    mobileLcp: string;
    mobileCls: string;
    mobileTbt: string;
  };
  actions: {
    number: string;
    priority: string;
    effort: string;
    area: string;
    source: string;
    task: string;
    recommendation: string;
    affectedCount: string;
    affectedUrls: string;
    status: string;
  };
  statuses: [string, string, string, string];
  pages: {
    url: string;
    statusCode: string;
    responseTime: string;
    title: string;
    words: string;
    headings: string;
    imagesWithoutAlt: string;
    structuredData: string;
    pageType: string;
    intent: string;
    helpfulness: string;
    specificity: string;
    trust: string;
    confidence: string;
    needsReview: string;
  };
  keywords: {
    keyword: string;
    position: string;
    volume: string;
    traffic: string;
    category: string;
    relevance: string;
    confidence: string;
    needsReview: string;
    page: string;
  };
  backlinks: {
    metric: string;
    value: string;
    backlinks: string;
    referringDomains: string;
    brokenPages: string;
    brokenTargetsHeading: string;
    backlinksColumn: string;
    domainsColumn: string;
  };
  competitors: {
    domain: string;
    commonKeywords: string;
    traffic: string;
  };
  review: {
    type: string;
    item: string;
    page: string;
    keyword: string;
  };
  yes: string;
  no: string;
};
