import { type PageAssessment } from 'src/types/page-assessment';

const total = (assessment: PageAssessment): number =>
  assessment.helpfulness + assessment.specificity + assessment.trust;

// Weakest rating first. Among equals the unsure judgements come first, because a person has to look at them.
export const sortWeakestFirst = (assessments: PageAssessment[]): PageAssessment[] =>
  [...assessments].sort(
    (first, second) =>
      total(first) - total(second) ||
      Number(second.needsReview) - Number(first.needsReview) ||
      first.url.localeCompare(second.url),
  );
