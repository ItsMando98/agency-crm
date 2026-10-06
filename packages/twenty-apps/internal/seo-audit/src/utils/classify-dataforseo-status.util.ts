import { type DataForSeoErrorKind } from 'src/dataforseo-client/dataforseo-error';

// DataForSEO reports problems as HTTP status or as a five digit code
// whose first three digits mirror the HTTP status (for example 40101).
export const classifyDataForSeoStatus = (code: number): DataForSeoErrorKind => {
  const httpLikeStatus = code >= 10000 ? Math.floor(code / 100) : code;

  if (httpLikeStatus === 401) {
    return 'AUTHENTICATION';
  }

  if (httpLikeStatus === 402) {
    return 'PAYMENT';
  }

  if (httpLikeStatus === 403) {
    return 'ACCESS';
  }

  return 'OTHER';
};
