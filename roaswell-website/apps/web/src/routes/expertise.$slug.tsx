import type { Route } from './+types/expertise.$slug';
import { seo, siteOriginFrom } from '@/lib/seo';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { DisciplineDetail } from '@/components/expertise/discipline-detail';
import { ContactCta } from '@/components/contact-cta';
import { getDiscipline } from '@/data/expertise';
import { buildServiceSchema, buildBreadcrumbSchema } from '@/lib/schema';

export function loader({ params }: Route.LoaderArgs) {
	const discipline = getDiscipline(params.slug);
	if (!discipline) {
		throw new Response('Discipline not found', { status: 404 });
	}
	return { discipline };
}

export function meta({ matches, location, loaderData }: Route.MetaArgs) {
	const d = loaderData?.discipline;
	if (!d) {
		return seo(
			{ matches, location },
			{ title: 'Not found — ROASWELL', description: 'This page could not be found.', noindex: true },
		);
	}
	const origin = siteOriginFrom(matches);
	return seo(
		{ matches, location },
		{
			title: `${d.name} Strategy & Execution — ROASWELL`,
			description: d.summary,
			type: 'website',
			jsonLd: [
				buildServiceSchema(origin, d),
				buildBreadcrumbSchema(origin, [
					{ name: 'Home', path: '/' },
					{ name: 'Expertise', path: '/expertise' },
					{ name: d.name, path: `/expertise/${d.slug}` },
				]),
			],
		},
	);
}

export default function DisciplineRoute({ loaderData }: Route.ComponentProps) {
	return (
		<>
			<SiteHeader />
			<main>
				<DisciplineDetail discipline={loaderData.discipline} />
				<ContactCta />
			</main>
			<SiteFooter />
		</>
	);
}
