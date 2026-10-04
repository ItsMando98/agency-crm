import type { Route } from './+types/expertise.$slug.$subSlug';
import { seo, siteOriginFrom } from '@/lib/seo';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { SubpageDetail } from '@/components/expertise/subpage-detail';
import { ContactCta } from '@/components/contact-cta';
import { getSubpage } from '@/data/expertise';
import { buildBreadcrumbSchema, buildFaqSchema, buildSubpageSchema } from '@/lib/schema';

export function loader({ params }: Route.LoaderArgs) {
	const found = getSubpage(params.slug, params.subSlug);
	if (!found) {
		throw new Response('Page not found', { status: 404 });
	}
	return found;
}

export function meta({ matches, location, loaderData }: Route.MetaArgs) {
	if (!loaderData) {
		return seo(
			{ matches, location },
			{ title: 'Not found — ROASWELL', description: 'This page could not be found.', noindex: true },
		);
	}
	const { discipline, subpage } = loaderData;
	const origin = siteOriginFrom(matches);
	return seo(
		{ matches, location },
		{
			title: `${subpage.name} — ${discipline.name} — ROASWELL`,
			description: subpage.summary,
			jsonLd: [
				buildSubpageSchema(origin, discipline, subpage),
				buildFaqSchema(subpage.faqs),
				buildBreadcrumbSchema(origin, [
					{ name: 'Home', path: '/' },
					{ name: 'Expertise', path: '/expertise' },
					{ name: discipline.name, path: `/expertise/${discipline.slug}` },
					{ name: subpage.name, path: `/expertise/${discipline.slug}/${subpage.slug}` },
				]),
			],
		},
	);
}

export default function SubpageRoute({ loaderData }: Route.ComponentProps) {
	return (
		<>
			<SiteHeader />
			<main>
				<SubpageDetail discipline={loaderData.discipline} subpage={loaderData.subpage} />
				<ContactCta />
			</main>
			<SiteFooter />
		</>
	);
}
