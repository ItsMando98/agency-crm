import type { Route } from './+types/expertise.$slug.$subSlug';
import { metaContext, seo } from '@/lib/seo';
import { findSubpage, getDisciplines, localeFromParams } from '@/lib/content.server';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { SubpageDetail } from '@/components/expertise/subpage-detail';
import { ContactCta } from '@/components/contact-cta';
import { buildBreadcrumbSchema, buildFaqSchema, buildSubpageSchema } from '@/lib/schema';

export async function loader({ params }: Route.LoaderArgs) {
	const disciplines = await getDisciplines(localeFromParams(params));
	const found = findSubpage(disciplines, params.slug, params.subSlug);
	if (!found) {
		throw new Response('Page not found', { status: 404 });
	}
	return {
		...found,
		disciplineNav: disciplines.map(({ slug, number, name }) => ({ slug, number, name })),
	};
}

export function meta({ matches, location, loaderData }: Route.MetaArgs) {
	const { origin, locale, t } = metaContext(matches);
	if (!loaderData) {
		return seo(
			{ matches, location },
			{ title: t('meta.notFound.title'), description: t('meta.notFound.description'), noindex: true },
		);
	}
	const { discipline, subpage } = loaderData;
	const site = { origin, locale };
	return seo(
		{ matches, location },
		{
			title: t('meta.subpage.title', { name: subpage.name, discipline: discipline.name }),
			description: subpage.summary,
			jsonLd: [
				buildSubpageSchema(site, discipline, subpage),
				buildFaqSchema(subpage.faqs),
				buildBreadcrumbSchema(site, [
					{ name: t('breadcrumb.home'), path: '/' },
					{ name: t('nav.expertise'), path: '/expertise' },
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
				<SubpageDetail
					discipline={loaderData.discipline}
					subpage={loaderData.subpage}
					disciplineNav={loaderData.disciplineNav}
				/>
				<ContactCta />
			</main>
			<SiteFooter />
		</>
	);
}
