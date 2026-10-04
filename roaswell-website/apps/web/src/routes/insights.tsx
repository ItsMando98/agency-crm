import type { Route } from './+types/insights';
import { seo, siteOriginFrom } from '@/lib/seo';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { InsightsList } from '@/components/insights/list';
import { ContactCta } from '@/components/contact-cta';
import { buildBreadcrumbSchema } from '@/lib/schema';

export function meta({ matches, location }: Route.MetaArgs) {
	const origin = siteOriginFrom(matches);
	return seo(
		{ matches, location },
		{
			title: 'Insights & Strategy Notes — ROASWELL',
			description:
				'Notes on search, content, paid media and motion — and how the disciplines fit together as one compounding growth system.',
			jsonLd: buildBreadcrumbSchema(origin, [
				{ name: 'Home', path: '/' },
				{ name: 'Insights', path: '/insights' },
			]),
		},
	);
}

export default function InsightsPage() {
	return (
		<>
			<SiteHeader />
			<main>
				<InsightsList />
				<ContactCta />
			</main>
			<SiteFooter />
		</>
	);
}
