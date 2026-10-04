import type { Route } from './+types/expertise';
import { seo, siteOriginFrom } from '@/lib/seo';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ExpertiseHero } from '@/components/expertise/hero';
import { ExpertiseDisciplines } from '@/components/expertise/disciplines';
import { ContactCta } from '@/components/contact-cta';
import { buildBreadcrumbSchema } from '@/lib/schema';

export function meta({ matches, location }: Route.MetaArgs) {
	const origin = siteOriginFrom(matches);
	return seo(
		{ matches, location },
		{
			title: 'Expertise: SEO, Meta Ads, Google Ads & Motion Graphics — ROASWELL',
			description:
				'Four disciplines — SEO & Content, Meta Ads, Google Ads and Motion Graphics — as one growth system. Search captures intent, content builds demand, paid media accelerates what works, motion makes it unforgettable.',
			jsonLd: buildBreadcrumbSchema(origin, [
				{ name: 'Home', path: '/' },
				{ name: 'Expertise', path: '/expertise' },
			]),
		},
	);
}

export default function ExpertisePage() {
	return (
		<>
			<SiteHeader />
			<main>
				<ExpertiseHero />
				<ExpertiseDisciplines />
				<ContactCta />
			</main>
			<SiteFooter />
		</>
	);
}
