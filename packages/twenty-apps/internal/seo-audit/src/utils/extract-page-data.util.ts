import { parse } from 'node-html-parser';

import { MAX_TEXT_EXCERPT_CHARS } from 'src/constants/crawl.const';
import { type CrawledPage } from 'src/types/crawled-page';
import { collectStructuredDataTypes } from 'src/utils/collect-structured-data-types.util';
import { resolveInternalLink } from 'src/utils/resolve-internal-link.util';

type ExtractPageDataParams = {
  html: string | null;
  pageUrl: string;
  origin: string;
  statusCode: number;
  responseTimeMs: number;
  contentType: string | null;
  xRobotsTag: string | null;
};

const NON_CONTENT_SELECTOR = 'script, style, noscript, svg, template';

const emptyToNull = (value: string | undefined | null): string | null => {
  const trimmed = value?.trim();

  return trimmed === undefined || trimmed === '' ? null : trimmed;
};

export const extractPageData = ({
  html,
  pageUrl,
  origin,
  statusCode,
  responseTimeMs,
  contentType,
  xRobotsTag,
}: ExtractPageDataParams): CrawledPage => {
  const isHtml = html !== null && /html/i.test(contentType ?? 'text/html');
  const basePage: CrawledPage = {
    url: pageUrl,
    statusCode,
    responseTimeMs,
    contentType,
    isHtml,
    title: null,
    metaDescription: null,
    canonicalUrl: null,
    robotsMeta: null,
    isNoindex: /noindex/i.test(xRobotsTag ?? ''),
    lang: null,
    hasViewport: false,
    h1Count: 0,
    wordCount: 0,
    imageCount: 0,
    imagesWithoutAlt: 0,
    insecureResourceUrls: [],
    internalLinks: [],
    structuredDataTypes: [],
    textExcerpt: '',
  };

  if (!isHtml || html === null) {
    return basePage;
  }

  const root = parse(html);
  const metaTags = root.querySelectorAll('meta');
  const findMeta = (name: string): string | null =>
    emptyToNull(
      metaTags
        .find((tag) => tag.getAttribute('name')?.toLowerCase() === name)
        ?.getAttribute('content'),
    );
  const robotsMeta = [findMeta('robots'), findMeta('googlebot')]
    .filter((value): value is string => value !== null)
    .join(', ');
  const canonicalLink = root
    .querySelectorAll('link')
    .find((tag) => tag.getAttribute('rel')?.toLowerCase().includes('canonical'));
  const images = root.querySelectorAll('img');
  const isHttpsPage = pageUrl.startsWith('https://');
  const insecureResourceUrls = isHttpsPage
    ? [
        ...images.map((tag) => tag.getAttribute('src')),
        ...root.querySelectorAll('script[src]').map((tag) => tag.getAttribute('src')),
        ...root
          .querySelectorAll('link')
          .filter((tag) => tag.getAttribute('rel')?.toLowerCase().includes('stylesheet'))
          .map((tag) => tag.getAttribute('href')),
        ...root.querySelectorAll('iframe').map((tag) => tag.getAttribute('src')),
      ].filter(
        (value): value is string =>
          value !== undefined && value.trim().toLowerCase().startsWith('http://'),
      )
    : [];
  const internalLinks = [
    ...new Set(
      root
        .querySelectorAll('a[href]')
        .map((tag) => resolveInternalLink(tag.getAttribute('href') ?? '', pageUrl, origin))
        .filter((value): value is string => value !== null),
    ),
  ];
  const structuredDataTypes = collectStructuredDataTypes(
    root
      .querySelectorAll('script')
      .filter((tag) => tag.getAttribute('type')?.toLowerCase() === 'application/ld+json')
      .map((tag) => tag.text),
  );
  const h1Count = root.querySelectorAll('h1').length;

  root.querySelectorAll(NON_CONTENT_SELECTOR).forEach((node) => node.remove());

  const text = (root.querySelector('body') ?? root).text.replace(/\s+/g, ' ').trim();

  return {
    ...basePage,
    title: emptyToNull(root.querySelector('title')?.text),
    metaDescription: findMeta('description'),
    canonicalUrl: emptyToNull(canonicalLink?.getAttribute('href')),
    robotsMeta: emptyToNull(robotsMeta),
    isNoindex: basePage.isNoindex || /noindex/i.test(robotsMeta),
    lang: emptyToNull(root.querySelector('html')?.getAttribute('lang')),
    hasViewport: findMeta('viewport') !== null,
    h1Count,
    wordCount: text === '' ? 0 : text.split(' ').length,
    imageCount: images.length,
    imagesWithoutAlt: images.filter((tag) => tag.getAttribute('alt') === undefined).length,
    insecureResourceUrls: [...new Set(insecureResourceUrls)],
    internalLinks,
    structuredDataTypes,
    textExcerpt: text.slice(0, MAX_TEXT_EXCERPT_CHARS),
  };
};
