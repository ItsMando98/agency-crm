import {
	data,
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	redirect,
	Scripts,
	ScrollRestoration,
	useLoaderData,
	useRouteLoaderData,
} from 'react-router';
import type { Route } from './+types/root';
import stylesheet from '@/index.css?url';
import { siteOrigin } from '@/lib/site-origin.server';
import { DEFAULT_LOCALE, getLocaleDefinition, isLocale } from '@/i18n/locales';
import { loadUiMessages, localizeContent } from '@/i18n/messages.server';
import { disciplines } from '@/data/expertise';
import { getBookingUrl } from '@/data/company.server';
import { I18nProvider } from '@/i18n/context';
import { HorizonsPreviewScripts } from './horizons-preview-scripts';

export const links: Route.LinksFunction = () => [
	{ rel: 'stylesheet', href: stylesheet },
	{ rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
];

export async function loader({ request, params }: Route.LoaderArgs) {
	const origin = siteOrigin(request);
	const requested = params.lang;

	if (requested !== undefined) {
		if (!isLocale(requested)) {
			throw new Response('Not found', { status: 404 });
		}
		if (requested === DEFAULT_LOCALE) {
			const url = new URL(request.url);
			const bare = url.pathname.replace(/^\/en(?=\/|$)/, '') || '/';
			throw redirect(`${bare}${url.search}`, 301);
		}
	}

	const locale = requested ?? DEFAULT_LOCALE;
	const [messages, localizedDisciplines] = await Promise.all([
		loadUiMessages(locale),
		localizeContent(disciplines, locale, 'expertise'),
	]);

	return data(
		{
			origin,
			locale,
			messages,
			bookingUrl: getBookingUrl(),
			disciplineNav: localizedDisciplines.map(({ slug, number, name }) => ({ slug, number, name })),
		},
		{ headers: { Link: `<${origin}/sitemap.xml>; rel="sitemap"; type="application/xml"` } },
	);
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
	return loaderHeaders;
}

export function Layout({ children }: { children: React.ReactNode }) {
	const rootData = useRouteLoaderData<typeof loader>('root');
	const locale = getLocaleDefinition(rootData?.locale ?? DEFAULT_LOCALE);

	return (
		<html lang={locale.hreflang} dir={locale.direction}>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
				<HorizonsPreviewScripts />
			</head>
			<body>
				<div id="root">{children}</div>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	const { locale, messages } = useLoaderData<typeof loader>();

	return (
		<I18nProvider locale={locale} messages={messages}>
			<Outlet />
		</I18nProvider>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = 'Oops!';
	let details = 'An unexpected error occurred.';
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? '404' : 'Error';
		details =
			error.status === 404
				? 'The requested page could not be found.'
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main>
			<h1>{message}</h1>
			<p>{details}</p>
			{stack ? (
				<pre>
					<code>{stack}</code>
				</pre>
			) : null}
		</main>
	);
}
