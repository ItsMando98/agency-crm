import { type RouteConfig, index, route } from '@react-router/dev/routes';

const pages = (prefix: string) => ({
	index: index('routes/home.tsx', { id: `${prefix}home` }),
	rest: [
		route('expertise', 'routes/expertise.tsx', { id: `${prefix}expertise` }),
		route('expertise/:slug', 'routes/expertise.$slug.tsx', { id: `${prefix}expertise-discipline` }),
		route('expertise/:slug/:subSlug', 'routes/expertise.$slug.$subSlug.tsx', { id: `${prefix}expertise-subpage` }),
		route('work', 'routes/work.tsx', { id: `${prefix}work` }),
		route('work/:slug', 'routes/work.$slug.tsx', { id: `${prefix}work-study` }),
		route('approach', 'routes/approach.tsx', { id: `${prefix}approach` }),
		route('insights', 'routes/insights.tsx', { id: `${prefix}insights` }),
		route('insights/:slug', 'routes/insights.$slug.tsx', { id: `${prefix}insights-article` }),
		route('about', 'routes/about.tsx', { id: `${prefix}about` }),
		route('contact', 'routes/contact.tsx', { id: `${prefix}contact` }),
		route('legal', 'routes/legal.tsx', { id: `${prefix}legal` }),
		route('privacy', 'routes/privacy.tsx', { id: `${prefix}privacy` }),
	],
});

const defaultPages = pages('');
const localizedPages = pages('localized-');

export default [
	defaultPages.index,
	...defaultPages.rest,
	route(':lang', 'routes/locale-layout.tsx', [localizedPages.index, ...localizedPages.rest]),
	route('sitemap.xml', 'routes/sitemap.xml.ts'),
	route('robots.txt', 'routes/robots.txt.ts'),
	route('llms.txt', 'routes/llms.txt.ts'),
	route('llms-full.txt', 'routes/llms-full.txt.ts'),
	route('api/health', 'routes/api.health.ts'),
	route('api/contact', 'routes/api.contact.ts'),
	route('api/*', 'routes/api.$.ts'),
] satisfies RouteConfig;
