import type { Route } from './+types/expertise.$slug';
import { metaContext, seo } from '@/lib/seo';
import { getDisciplines, localeFromParams } from '@/lib/content.server';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { DisciplineDetail } from '@/components/expertise/discipline-detail';
import { ContactCta } from '@/components/contact-cta';
import { buildServiceSchema, buildBreadcrumbSchema } from '@/lib/schema';

export async function loader({ params }: Route.LoaderArgs) {
	const disciplines = await getDisciplines(localeFromParams(params));
	const discipline = disciplines.find(item => item.slug === params.slug);
	if (!discipline) {
		throw new Response('Discipline not found', { status: 404 });
	}
	return { discipline, others: disciplines.filter(item => item.slug !== discipline.slug) };
}

export function meta({ matches, location, loaderData }: Route.MetaArgs) {
	const { origin, locale, t } = metaContext(matches);
	const discipline = loaderData?.discipline;
	if (!discipline) {
		return seo(
			{ matches, location },
			{ title: t('meta.notFound.title'), description: t('meta.notFound.description'), noindex: true },
		);
	}
	const site = { origin, locale };
	return seo(
		{ matches, location },
		{
			title: t('meta.discipline.title', { name: discipline.name }),
			description: discipline.summary,
			type: 'website',
			jsonLd: [
				buildServiceSchema(site, discipline),
				buildBreadcrumbSchema(site, [
					{ name: t('breadcrumb.home'), path: '/' },
					{ name: t('nav.expertise'), path: '/expertise' },
					{ name: discipline.name, path: `/expertise/${discipline.slug}` },
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
				<DisciplineDetail discipline={loaderData.discipline} others={loaderData.others} />
				<ContactCta />
			</main>
			<SiteFooter />
		</>
	);
}
