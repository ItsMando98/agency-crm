import {
  FACT_SHEET_MAX_COMPETITOR_DOMAINS,
  FACT_SHEET_MAX_KEYWORDS,
  FACT_SHEET_MAX_TASKS,
  FACT_SHEET_MAX_WEAKEST_PAGES,
} from 'src/constants/audit-summary.const';
import { INSIGHTS_LABELS } from 'src/constants/insights-labels.const';
import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { KEYWORD_CATEGORY } from 'src/constants/seo-audit.constants';
import { type AuditInsights } from 'src/types/audit-insights';
import { type AiVisibility } from 'src/types/ai-visibility';
import { type AreaScores } from 'src/types/area-scores';
import { type AuditLanguage } from 'src/types/audit-language';
import { type AuditTask } from 'src/types/audit-task';
import { type MarketData } from 'src/types/market-data';
import { type PageAssessment } from 'src/types/page-assessment';
import { type ScoredKeyword } from 'src/types/scored-keyword';
import { type SiteProfile } from 'src/types/site-profile';
import { getTaskHorizon } from 'src/utils/get-task-horizon.util';
import { sortWeakestFirst } from 'src/utils/sort-weakest-first.util';

type BuildAuditFactSheetParams = {
  origin: string;
  language: AuditLanguage;
  score: number;
  grade: string;
  areaScores: AreaScores;
  pageCount: number;
  tasks: AuditTask[];
  assessments: PageAssessment[];
  siteProfile: SiteProfile | null;
  keywords: ScoredKeyword[];
  marketData: MarketData | null;
  aiVisibility: AiVisibility | null;
  insights: Pick<
    AuditInsights,
    'rulesOnlyScore' | 'confidence' | 'strengths' | 'competingPages' | 'missingLocations'
  >;
};

// The only material the summary writer sees. Every number it may name is in here.
export const buildAuditFactSheet = ({
  origin,
  language,
  score,
  grade,
  areaScores,
  pageCount,
  tasks,
  assessments,
  siteProfile,
  keywords,
  marketData,
  aiVisibility,
  insights,
}: BuildAuditFactSheetParams): Record<string, unknown> => {
  const areaLabels = REPORT_LABELS[language].areas;
  const insightLabels = INSIGHTS_LABELS[language];
  const countCategory = (category: string): number =>
    keywords.filter((keyword) => keyword.category === category).length;
  const relevantKeywords = keywords
    .filter(
      (keyword) =>
        keyword.category === KEYWORD_CATEGORY.TOP_3 ||
        keyword.category === KEYWORD_CATEGORY.QUICK_WIN ||
        keyword.category === KEYWORD_CATEGORY.NEAR_PAGE_ONE,
    )
    .sort((first, second) => second.searchVolume - first.searchVolume);
  const brokenTargets = marketData?.backlinkTargets ?? [];

  return {
    website: origin,
    language,
    score,
    grade,
    scoreWithoutContentJudgement: insights.rulesOnlyScore,
    pagesChecked: pageCount,
    areas: Object.fromEntries(
      (Object.entries(areaScores) as [string, number][]).map(([area, value]) => [
        areaLabels[area as keyof typeof areaLabels] ?? area,
        value,
      ]),
    ),
    siteProfile:
      siteProfile === null
        ? null
        : {
            businessModel: siteProfile.businessModel,
            servesLocalArea: siteProfile.servesLocalArea,
            confidence: siteProfile.confidence,
          },
    tasks: {
      total: tasks.length,
      critical: tasks.filter((task) => task.priority === 'CRITICAL').length,
      items: tasks.slice(0, FACT_SHEET_MAX_TASKS).map((task, index) => ({
        number: index + 1,
        title: task.name,
        area: areaLabels[task.area] ?? task.area,
        priority: task.priority,
        effort: task.effort,
        horizon: getTaskHorizon(task),
        affectedPages: task.affectedUrls.length,
      })),
    },
    pages: {
      assessed: insights.confidence.total,
      clearJudgements: insights.confidence.definitive,
      clearJudgementsPercent: insights.confidence.sharePercent,
      weakest: sortWeakestFirst(assessments)
        .slice(0, FACT_SHEET_MAX_WEAKEST_PAGES)
        .map((assessment) => ({
          url: assessment.url,
          type: assessment.pageType,
          helpfulness: assessment.helpfulness,
          specificity: assessment.specificity,
          trust: assessment.trust,
          needsCheck: assessment.needsReview,
        })),
    },
    keywords: {
      rankedTotal: marketData?.rankings?.totalKeywords ?? null,
      estimatedMonthlyVisitors: marketData?.rankings?.estimatedMonthlyTraffic ?? null,
      topThree: countCategory(KEYWORD_CATEGORY.TOP_3),
      quickWins: countCategory(KEYWORD_CATEGORY.QUICK_WIN),
      nearPageOne: countCategory(KEYWORD_CATEGORY.NEAR_PAGE_ONE),
      notRelevant: countCategory(KEYWORD_CATEGORY.NOT_RELEVANT),
      best: relevantKeywords.slice(0, FACT_SHEET_MAX_KEYWORDS).map((keyword) => ({
        keyword: keyword.keyword,
        position: keyword.position,
        searchesPerMonth: keyword.searchVolume,
      })),
    },
    backlinks:
      marketData?.backlinks === null || marketData === null
        ? null
        : {
            total: marketData.backlinks.backlinks,
            referringDomains: marketData.backlinks.referringDomains,
            deadTargetPages: brokenTargets.length,
          },
    mobileSpeed:
      marketData?.lighthouse === null || marketData === null
        ? null
        : {
            performanceScore: marketData.lighthouse.performanceScore,
            largestContentfulPaintMs: marketData.lighthouse.largestContentfulPaintMs,
          },
    aiVisibility:
      aiVisibility === null || aiVisibility.presenceRate === null
        ? null
        : {
            questionsTested: aiVisibility.queriesTested,
            namedInAnswersPercent: Math.round(aiVisibility.presenceRate * 100),
            namedInsteadMostOften: [
              ...new Set(aiVisibility.rows.flatMap((row) => row.instead)),
            ].slice(0, FACT_SHEET_MAX_COMPETITOR_DOMAINS),
          },
    strengths: insights.strengths.map((strength) => insightLabels.describeStrength(strength, areaLabels)),
    competingTopics: insights.competingPages.map((group) => ({ topic: group.topic, pages: group.urls.length })),
    placesWithoutPage: insights.missingLocations.map((location) => ({
      place: location.place,
      searchesPerMonth: location.searchVolume,
    })),
  };
};
