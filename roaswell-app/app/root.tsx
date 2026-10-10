import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { Toaster } from 'sonner';

import type { Route } from './+types/root';
import './app.css';

export const meta: Route.MetaFunction = () => [{ title: 'Roaswell' }];

export const Layout = ({ children }: { children: React.ReactNode }) => (
  <html lang="de">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <Meta />
      <Links />
    </head>
    <body>
      {children}
      <Toaster position="bottom-right" richColors />
      <ScrollRestoration />
      <Scripts />
    </body>
  </html>
);

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const isResponse = isRouteErrorResponse(error);
  const title = isResponse && error.status === 404 ? 'Seite nicht gefunden' : 'Etwas ist schiefgelaufen';

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-3 px-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground">
        {isResponse ? `Fehlercode ${error.status}.` : 'Bitte lade die Seite neu. Besteht das Problem weiter, melde dich beim Team.'}
      </p>
      <a className="text-primary underline" href="/">Zur Startseite</a>
    </main>
  );
}
