import { index, layout, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  route('login', 'routes/login.tsx'),
  route('auth/verify', 'routes/auth.verify.tsx'),
  route('logout', 'routes/logout.tsx'),
  route('api/health', 'routes/api.health.tsx'),
  layout('routes/app-layout.tsx', [
    index('routes/dashboard.tsx'),
    route('audits', 'routes/audits.tsx'),
    route('audits/:auditId', 'routes/audit-detail.tsx'),
    route('companies', 'routes/companies.tsx'),
    route('companies/:companyId', 'routes/company-detail.tsx'),
    route('people', 'routes/people.tsx'),
    route('pipeline', 'routes/pipeline.tsx'),
  ]),
] satisfies RouteConfig;
