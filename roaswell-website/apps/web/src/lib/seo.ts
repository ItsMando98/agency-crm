type Match = { id?: string; loaderData?: unknown } | undefined;

type SeoContext = { matches: Match[]; location: { pathname: string } };

type SeoOptions = {
	title: string;
	description: string;
	type?: 'website' | 'article';
	image?: string;
	noindex?: boolean;
	jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
};

export function siteOriginFrom(matches: Match[]): string {
	const root = matches.find(m => m?.id === 'root');
	const data = root?.loaderData as { origin?: string } | undefined;
	return data?.origin ?? '';
}

export function absoluteUrl(origin: string, pathname: string): string {
	return `${origin}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

export function seo({ matches, location }: SeoContext, options: SeoOptions) {
	const origin = siteOriginFrom(matches);
	const url = absoluteUrl(origin, location.pathname);
	const imageUrl = absoluteUrl(origin, options.image || '/og-image.png');

	const tags: Array<Record<string, unknown>> = [
		{ title: options.title },
		{ name: 'description', content: options.description },
		{ tagName: 'link', rel: 'canonical', href: url },

		// OpenGraph
		{ property: 'og:site_name', content: 'ROASWELL' },
		{ property: 'og:title', content: options.title },
		{ property: 'og:description', content: options.description },
		{ property: 'og:type', content: options.type ?? 'website' },
		{ property: 'og:url', content: url },
		{ property: 'og:image', content: imageUrl },
		{ property: 'og:image:width', content: '1200' },
		{ property: 'og:image:height', content: '630' },
		{ property: 'og:image:alt', content: options.title },

		// Twitter Cards
		{ name: 'twitter:card', content: 'summary_large_image' },
		{ name: 'twitter:title', content: options.title },
		{ name: 'twitter:description', content: options.description },
		{ name: 'twitter:image', content: imageUrl },
	];

	if (options.noindex) {
		tags.push({ name: 'robots', content: 'noindex, nofollow' });
	}

	if (options.jsonLd) {
		if (Array.isArray(options.jsonLd)) {
			options.jsonLd.forEach(schema => {
				tags.push({ 'script:ld+json': schema });
			});
		} else {
			tags.push({ 'script:ld+json': options.jsonLd });
		}
	}

	return tags;
}
