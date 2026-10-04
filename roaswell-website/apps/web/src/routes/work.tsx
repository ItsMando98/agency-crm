import type { Route } from './+types/work';
import { seo, siteOriginFrom } from '@/lib/seo';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { WorkList } from '@/components/work/list';
import { ContactCta } from '@/components/contact-cta';
import { buildBreadcrumbSchema } from '@/lib/schema';

export function meta({ matches, location }: Route.MetaArgs) {
	const origin = siteOriginFrom(matches);
	return seo(
		{ matches, location },
		{
			title: 'Selected Work & Case Studies — ROASWELL',
			description:
				'Illustrative case studies in SEO & Content, Meta Ads, Google Ads, and Motion Graphics — how we think about performance and commercial outcomes, not vanity metrics.',
			jsonLd: buildBreadcrumbSchema(origin, [
				{ name: 'Home', path: '/' },
				{ name: 'Work', path: '/work' },
			]),
		},
	);
}

export default function WorkPage() {
	return (
		<>
			<SiteHeader />
			<main>
				<WorkList />
				<ContactCta />
			</main>
			<SiteFooter />
		</>
	);
}
