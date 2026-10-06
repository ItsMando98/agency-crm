import type { Route } from './+types/home';
import { metaContext, seo } from '@/lib/seo';
import { getCaseStudies, getDisciplines, localeFromParams } from '@/lib/content.server';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Hero } from '@/components/home/hero';
import { Marquee } from '@/components/home/marquee';
import { Manifesto } from '@/components/home/manifesto';
import { GrowthSystem } from '@/components/home/growth-system';
import { Work } from '@/components/home/work';
import { Approach } from '@/components/home/approach';
import { Testimonials } from '@/components/home/testimonials';
import { Contact } from '@/components/home/contact';
import { buildOrganizationSchema, buildWebSiteSchema } from '@/lib/schema';

export async function loader({ params }: Route.LoaderArgs) {
	const locale = localeFromParams(params);
	const [disciplines, caseStudies] = await Promise.all([getDisciplines(locale), getCaseStudies(locale)]);
	return { disciplines, caseStudies };
}

export function meta({ matches, location, loaderData }: Route.MetaArgs) {
	const { origin, locale, t } = metaContext(matches);
	const site = { origin, locale };
	return seo(
		{ matches, location },
		{
			title: t('meta.home.title'),
			description: t('meta.home.description'),
			jsonLd: [
				buildOrganizationSchema(site, t, loaderData?.disciplines ?? []),
				buildWebSiteSchema(site, t),
			],
		},
	);
}

export default function HomePage({ loaderData }: Route.ComponentProps) {
	return (
		<>
			<SiteHeader />
			<main>
				<Hero />
				<Marquee />
				<Manifesto />
				<GrowthSystem disciplines={loaderData.disciplines} />
				<Work caseStudies={loaderData.caseStudies} />
				<Approach />
				<Testimonials />
				<Contact />
			</main>
			<SiteFooter />
		</>
	);
}
