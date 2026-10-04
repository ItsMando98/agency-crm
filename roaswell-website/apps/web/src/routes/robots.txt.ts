import type { Route } from './+types/robots.txt';
import { siteOrigin } from '@/lib/site-origin.server';

export function loader({ request }: Route.LoaderArgs) {
	const origin = siteOrigin(request);

	const robots = `# ROASWELL Robots Configuration
# https://roaswell.com

User-agent: *
Allow: /
Disallow: /api/

# LLM & AI Agents Indexing Standard (https://llmstxt.org)
# Full Knowledge Base: ${origin}/llms.txt
# Comprehensive Documentation: ${origin}/llms-full.txt

# Sitemaps
Sitemap: ${origin}/sitemap.xml
`;

	return new Response(robots, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=86400',
		},
	});
}
