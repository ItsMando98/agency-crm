import type { Route } from './+types/approach';
import { seo, siteOriginFrom } from '@/lib/seo';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ApproachPage } from '@/components/approach/page';
import { ContactCta } from '@/components/contact-cta';
import { buildBreadcrumbSchema } from '@/lib/schema';

export function meta({ matches, location }: Route.MetaArgs) {
	const origin = siteOriginFrom(matches);
	return seo(
		{ matches, location },
		{
			title: 'Studio Approach & Working Model — ROASWELL',
			description:
				'Senior-led, specialist-delivered, always accountable. How the ROASWELL studio works — and why keeping it small is how growth compounds.',
			jsonLd: buildBreadcrumbSchema(origin, [
				{ name: 'Home', path: '/' },
				{ name: 'Approach', path: '/approach' },
			]),
		},
	);
}

export default function ApproachRoute() {
	return (
		<>
			<SiteHeader />
			<main>
				<ApproachPage />
				<ContactCta />
			</main>
			<SiteFooter />
		</>
	);
}
