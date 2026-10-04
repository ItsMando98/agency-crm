import type { Route } from './+types/sitemap.xml';
import { siteOrigin } from '@/lib/site-origin.server';
import { caseStudies } from '@/data/case-studies';
import { articles } from '@/data/articles';

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
	{ path: '/work', changefreq: 'monthly', priority: '0.8' },
	{ path: '/approach', changefreq: 'monthly', priority: '0.7' },
	{ path: '/insights', changefreq: 'weekly', priority: '0.8' },
	{ path: '/about', changefreq: 'monthly', priority: '0.7' },
	{ path: '/contact', changefreq: 'monthly', priority: '0.7' },
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
	return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

function serializeSitemap(origin: string, entries: SitemapEntry[]): string {
	const urls = entries
		.map(entry => {
			const loc = escapeXml(toLoc(origin, entry.path));
			const lastmod = entry.lastmod ? `\n\t\t<lastmod>${escapeXml(entry.lastmod)}</lastmod>` : '';
			const changefreq = entry.changefreq ? `\n\t\t<changefreq>${entry.changefreq}</changefreq>` : '';
			const priority = entry.priority ? `\n\t\t<priority>${entry.priority}</priority>` : '';

			return `\t<url>\n\t\t<loc>${loc}</loc>${lastmod}${changefreq}${priority}\n\t</url>`;
		})
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function getDynamicEntries(): Promise<SitemapEntry[]> {
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

	return [...work, ...insights];
}

export async function loader({ request }: Route.LoaderArgs) {
	const origin = siteOrigin(request);
	const entries: SitemapEntry[] = [
		...STATIC_ENTRIES,
		...(await getDynamicEntries()),
	];

	return new Response(serializeSitemap(origin, entries), {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
			'Access-Control-Allow-Origin': '*',
		},
	});
}
