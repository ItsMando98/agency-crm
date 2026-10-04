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
			title: 'Expertise: SEO, Meta Ads & Google Ads — ROASWELL',
			description:
				'Three disciplines — SEO & Content, Meta Ads, and Google Ads — as one growth system. Search captures intent, content builds demand, paid media accelerates what works.',
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
