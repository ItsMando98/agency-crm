import type { Config } from '@react-router/dev/config';

export default {
  ssr: true,
  // Behind the proxy the app sees its address as http, while the browser sends
  // an https origin. Without this entry every form post is refused as a
  // possible cross-site request.
  allowedActionOrigins: ['app.roaswell.com'],
} satisfies Config;
