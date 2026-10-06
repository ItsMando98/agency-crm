import {
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
} from 'src/constants/seo-thresholds.const';
import { type CrawledPage } from 'src/types/crawled-page';
import { type Finding } from 'src/types/finding';
import { findDuplicateUrls } from 'src/utils/find-duplicate-urls.util';
import { isAuditablePage } from 'src/utils/is-auditable-page.util';

export const checkOnPage = (pages: CrawledPage[]): Finding[] => {
  const auditablePages = pages.filter(isAuditablePage);
  const urlsWhere = (predicate: (page: CrawledPage) => boolean): string[] =>
    auditablePages.filter(predicate).map((page) => page.url);

  const findings: Finding[] = [
    { ruleId: 'TITLE_MISSING', affectedUrls: urlsWhere((page) => page.title === null) },
    {
      ruleId: 'TITLE_TOO_LONG',
      affectedUrls: urlsWhere((page) => (page.title?.length ?? 0) > TITLE_MAX_LENGTH),
    },
    {
      ruleId: 'TITLE_TOO_SHORT',
      affectedUrls: urlsWhere(
        (page) => page.title !== null && page.title.length < TITLE_MIN_LENGTH,
      ),
    },
    {
      ruleId: 'TITLE_DUPLICATE',
      affectedUrls: findDuplicateUrls(auditablePages, (page) => page.title),
    },
    {
      ruleId: 'DESCRIPTION_MISSING',
      affectedUrls: urlsWhere((page) => page.metaDescription === null),
    },
    {
      ruleId: 'DESCRIPTION_TOO_LONG',
      affectedUrls: urlsWhere(
        (page) => (page.metaDescription?.length ?? 0) > DESCRIPTION_MAX_LENGTH,
      ),
    },
    {
      ruleId: 'DESCRIPTION_DUPLICATE',
      affectedUrls: findDuplicateUrls(auditablePages, (page) => page.metaDescription),
    },
    { ruleId: 'H1_MISSING', affectedUrls: urlsWhere((page) => page.h1Count === 0) },
    { ruleId: 'H1_MULTIPLE', affectedUrls: urlsWhere((page) => page.h1Count > 1) },
    { ruleId: 'LANG_MISSING', affectedUrls: urlsWhere((page) => page.lang === null) },
    {
      ruleId: 'CANONICAL_MISSING',
      affectedUrls: urlsWhere((page) => page.canonicalUrl === null),
    },
    {
      ruleId: 'IMAGES_WITHOUT_ALT',
      affectedUrls: urlsWhere((page) => page.imagesWithoutAlt > 0),
    },
  ];

  return findings.filter((finding) => finding.affectedUrls.length > 0);
};
