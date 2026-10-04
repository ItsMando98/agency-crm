import type { Route } from './+types/llms.txt';
import { siteOrigin } from '@/lib/site-origin.server';
import { disciplines } from '@/data/expertise';

export function loader({ request }: Route.LoaderArgs) {
	const origin = siteOrigin(request);

	const specialisms = disciplines
		.flatMap(d => d.subpages.map(subpage => `- [${subpage.name}](${origin}/expertise/${d.slug}/${subpage.slug}): ${subpage.summary}`))
		.join('\n');

	const content = `# ROASWELL

> Independent digital growth studio specializing in SEO & Content, Meta Ads, Google Ads, and Motion Graphics.

ROASWELL is an independent, senior-led digital marketing and growth studio. We unite four core disciplines—organic search (SEO & Content Strategy), paid social performance (Meta Ads), high-intent paid search (Google Ads), and performance-led Motion Graphics—into a unified, compounding growth engine.

## Core Disciplines & Services

- [SEO & Content Strategy](${origin}/expertise/seo-content): Intent mapping, commercial SEO, technical crawlability, and compounding editorial architecture.
- [Meta Ads Management](${origin}/expertise/meta-ads): High-velocity creative testing, full-funnel paid social campaigns, audience architecture, and conversion optimization across Facebook and Instagram.
- [Google Ads Performance](${origin}/expertise/google-ads): High-intent search, Google Shopping, conversion value modeling, and incrementality-first bidding.
- [Motion Graphics](${origin}/expertise/motion-graphics): Paid social creative, explainer videos, product animation, brand films, and web motion built for creative testing.
- [Studio Approach & Philosophy](${origin}/approach): Fewer clients, senior execution, transparent commercial reporting, no agency bloat.

## Specialisms

${specialisms}

## Key Differentiators & Working Model

- Senior-Led Execution: The specialists who shape strategy execute the campaigns. No account handoffs, no junior churn, no agency bloat.
- Honest Measurement: Incrementality, blended customer acquisition cost (CAC), and server-side tracking rather than flattering platform-reported attribution.
- Compounding Architecture: Search captures existing demand; content creates consideration; paid media accelerates proven creative assets.

## Case Studies & Quantifiable Outcomes

- [Turning Search Intent into Demand](${origin}/work/search-to-significance): +120% organic traffic target, 2.4× qualified pipeline for B2B brand.
- [Making Acquisition Work Harder](${origin}/work/making-acquisition-work-harder): 4.2× ROAS recovery, −32% customer acquisition cost for DTC eCommerce brand.
- [Full-Funnel Foundations](${origin}/work/full-funnel-foundations): Pre-launch organic topical authority combined with paid social demand generation.

## Key Articles & Insights

- [Why These Three Disciplines Belong Together](${origin}/insights/why-three-disciplines): How search, content, and paid media feed each other as a unified system.
- [Creative is the Targeting](${origin}/insights/creative-is-the-targeting): Building a high-velocity testing system for modern algorithmic ad platforms.
- [Measuring What Comes Back](${origin}/insights/measuring-what-comes-back): Incrementality, blended CAC, and why platform self-reporting is a claim, not a fact.

## Contact & Engagements

- Studio Email: hello@roaswell.com
- Contact Form: ${origin}/contact
- Client Portal: https://client.roaswell.com
- Full Machine-Readable Knowledge Base: ${origin}/llms-full.txt
`;

	return new Response(content, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
			'Access-Control-Allow-Origin': '*',
		},
	});
}
