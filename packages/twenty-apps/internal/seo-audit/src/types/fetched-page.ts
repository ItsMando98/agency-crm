export type FetchedPage = {
  url: string;
  statusCode: number;
  responseTimeMs: number;
  contentType: string | null;
  xRobotsTag: string | null;
  body: string | null;
  errorMessage: string | null;
};
