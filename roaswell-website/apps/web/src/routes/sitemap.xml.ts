import type { Route } from './+types/sitemap.xml';
import { siteOrigin } from '@/lib/site-origin.server';
import { caseStudies } from '@/data/case-studies';
import { articles } from '@/data/articles';
import { disciplines } from '@/data/expertise';
import { DEFAULT_LOCALE, LOCALES, localizePath } from '@/i18n/locales';

type SitemapEntry = {
	path: string;
	lastmod?: string;
	changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
	priority?: string;
};

const STATIC_ENTRIES: SitemapEntry[] = [
	{ path: '/', changefreq: 'weekly', priority: '1.0' },
	{ path: '/expertise', changefreq: 'weekly', priority: '0.9' },
	{ path: '/expertise/seo-content', changefreq: 'weekly', priority: '0.9' },
	{ path: '/expertise/meta-ads', changefreq: 'weekly', priority: '0.9' },
	{ path: '/expertise/google-ads', changefreq: 'weekly', priority: '0.9' },
	{ path: '/expertise/motion-graphics', changefreq: 'weekly', priority: '0.9' },
	{ path: '/work', changefreq: 'monthly', priority: '0.8' },
	{ path: '/approach', changefreq: 'monthly', priority: '0.7' },
	{ path: '/insights', changefreq: 'weekly', priority: '0.8' },
	{ path: '/about', changefreq: 'monthly', priority: '0.7' },
	{ path: '/contact', changefreq: 'monthly', priority: '0.7' },
	{ path: '/legal', changefreq: 'yearly', priority: '0.3' },
	{ path: '/privacy', changefreq: 'yearly', priority: '0.3' },
];

function escapeXml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

function toLoc(origin: string, path: string): string {
	return escapeXml(`${origin}${path.startsWith('/') ? path : `/${path}`}`);
}

function serializeEntry(origin: string, entry: SitemapEntry, locale: string): string {
	const alternates = [
		...LOCALES.map(
			alternate =>
				`\n\t\t<xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${toLoc(origin, localizePath(entry.path, alternate.code))}"/>`,
		),
		`\n\t\t<xhtml:link rel="alternate" hreflang="x-default" href="${toLoc(origin, localizePath(entry.path, DEFAULT_LOCALE))}"/>`,
	].join('');
	const lastmod = entry.lastmod ? `\n\t\t<lastmod>${escapeXml(entry.lastmod)}</lastmod>` : '';
	const changefreq = entry.changefreq ? `\n\t\t<changefreq>${entry.changefreq}</changefreq>` : '';
	const priority = entry.priority ? `\n\t\t<priority>${entry.priority}</priority>` : '';

	return `\t<url>\n\t\t<loc>${toLoc(origin, localizePath(entry.path, locale))}</loc>${alternates}${lastmod}${changefreq}${priority}\n\t</url>`;
}

function serializeSitemap(origin: string, entries: SitemapEntry[]): string {
	const urls = entries
		.flatMap(entry => LOCALES.map(locale => serializeEntry(origin, entry, locale.code)))
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
}

function getDynamicEntries(): SitemapEntry[] {
	const work: SitemapEntry[] = caseStudies.map(c => ({
		path: `/work/${c.slug}`,
		lastmod: c.publishedAt,
		changefreq: 'monthly',
		priority: '0.8',
	}));

	const insights: SitemapEntry[] = articles.map(a => ({
		path: `/insights/${a.slug}`,
		lastmod: a.date,
		changefreq: 'monthly',
		priority: '0.8',
	}));

	const subpages: SitemapEntry[] = disciplines.flatMap(d =>
		d.subpages.map(subpage => ({
			path: `/expertise/${d.slug}/${subpage.slug}`,
			changefreq: 'weekly' as const,
			priority: '0.8',
		})),
	);

	return [...subpages, ...work, ...insights];
}

export function loader({ request }: Route.LoaderArgs) {
	const origin = siteOrigin(request);
	const entries: SitemapEntry[] = [...STATIC_ENTRIES, ...getDynamicEntries()];

	return new Response(serializeSitemap(origin, entries), {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
			'Access-Control-Allow-Origin': '*',
		},
	});
}
