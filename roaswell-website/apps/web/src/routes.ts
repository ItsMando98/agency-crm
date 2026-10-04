import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
	index('routes/home.tsx'),
	route('expertise', 'routes/expertise.tsx'),
	route('expertise/:slug', 'routes/expertise.$slug.tsx'),
	route('expertise/:slug/:subSlug', 'routes/expertise.$slug.$subSlug.tsx'),
	route('work', 'routes/work.tsx'),
	route('work/:slug', 'routes/work.$slug.tsx'),
	route('approach', 'routes/approach.tsx'),
	route('insights', 'routes/insights.tsx'),
	route('insights/:slug', 'routes/insights.$slug.tsx'),
	route('about', 'routes/about.tsx'),
	route('contact', 'routes/contact.tsx'),
	route('sitemap.xml', 'routes/sitemap.xml.ts'),
	route('robots.txt', 'routes/robots.txt.ts'),
	route('llms.txt', 'routes/llms.txt.ts'),
	route('llms-full.txt', 'routes/llms-full.txt.ts'),
	route('api/health', 'routes/api.health.ts'),
	route('api/contact', 'routes/api.contact.ts'),
	route('api/*', 'routes/api.$.ts'),
] satisfies RouteConfig;
