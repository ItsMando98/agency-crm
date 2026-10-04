import type { Route } from './+types/home';
import { seo, siteOriginFrom } from '@/lib/seo';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Hero } from '@/components/home/hero';
import { Services } from '@/components/home/services';
import { Work } from '@/components/home/work';
import { Approach } from '@/components/home/approach';
import { Testimonials } from '@/components/home/testimonials';
import { Contact } from '@/components/home/contact';
import { buildOrganizationSchema, buildWebSiteSchema } from '@/lib/schema';

export function meta({ matches, location }: Route.MetaArgs) {
	const origin = siteOriginFrom(matches);
	return seo(
		{ matches, location },
		{
			title: 'ROASWELL — Digital Growth Studio · SEO, Meta Ads & Google Ads',
			description:
				'Independent, senior-led digital growth studio. Specializing in SEO & Content, Meta Ads, and Google Ads. Focused execution, transparent measurement, no agency bloat.',
			jsonLd: [buildOrganizationSchema(origin), buildWebSiteSchema(origin)],
		},
	);
}

export default function HomePage() {
	return (
		<>
			<SiteHeader />
			<main>
				<Hero />
				<Services />
				<Work />
				<Approach />
				<Testimonials />
				<Contact />
			</main>
			<SiteFooter />
		</>
	);
}
