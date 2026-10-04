import type { Route } from './+types/about';
import { seo, siteOriginFrom } from '@/lib/seo';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { AboutPage } from '@/components/about/page';
import { buildAboutPageSchema, buildBreadcrumbSchema } from '@/lib/schema';

export function meta({ matches, location }: Route.MetaArgs) {
	const origin = siteOriginFrom(matches);
	return seo(
		{ matches, location },
		{
			title: 'About — ROASWELL Digital Growth Studio',
			description:
				'ROASWELL is an independent, senior-led digital growth studio. Fewer clients, senior attention, and a measurement standard that keeps the numbers honest.',
			jsonLd: [
				buildAboutPageSchema(origin),
				buildBreadcrumbSchema(origin, [
					{ name: 'Home', path: '/' },
					{ name: 'About', path: '/about' },
				]),
			],
		},
	);
}

export default function AboutRoute() {
	return (
		<>
			<SiteHeader />
			<main>
				<AboutPage />
			</main>
			<SiteFooter />
		</>
	);
}
