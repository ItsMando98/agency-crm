import {
  CRAWL_USER_AGENT,
  FETCH_TIMEOUT_MS,
  MAX_BODY_BYTES,
  MAX_REDIRECTS,
} from 'src/constants/crawl.const';
import { type FetchedPage } from 'src/types/fetched-page';
import { isPrivateHostname } from 'src/utils/is-private-hostname.util';

type FetchPageParams = {
  url: string;
  method?: 'GET' | 'HEAD';
  fetchImplementation?: typeof fetch;
};

const READABLE_CONTENT_TYPE_PATTERN = /(text|xml|json)/i;

const readCappedBody = async (response: Response): Promise<string> => {
  const reader = response.body?.getReader();

  if (reader === undefined) {
    return response.text();
  }

  const decoder = new TextDecoder();
  let body = '';
  let receivedBytes = 0;

  while (receivedBytes < MAX_BODY_BYTES) {
    const { done, value } = await reader.read();

    if (done) {
      return body + decoder.decode();
    }

    receivedBytes += value.byteLength;
    body += decoder.decode(value, { stream: true });
  }

  await reader.cancel();

  return body;
};

export const fetchPage = async ({
  url,
  method = 'GET',
  fetchImplementation = fetch,
}: FetchPageParams): Promise<FetchedPage> => {
  const startedAt = Date.now();
  let currentUrl = url;

  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
      const target = new URL(currentUrl);

      // Every hop is checked again so a public URL cannot redirect into the
      // internal network. DNS-level rebinding is not covered here.
      if (
        (target.protocol !== 'http:' && target.protocol !== 'https:') ||
        isPrivateHostname(target.hostname)
      ) {
        throw new Error(`Blocked non-public URL ${currentUrl}`);
      }

      const response = await fetchImplementation(currentUrl, {
        method,
        redirect: 'manual',
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: {
          'user-agent': CRAWL_USER_AGENT,
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.5',
        },
      });
      const location = response.headers.get('location');

      if (response.status >= 300 && response.status < 400 && location !== null) {
        await response.body?.cancel();
        currentUrl = new URL(location, currentUrl).toString();
        continue;
      }

      const contentType = response.headers.get('content-type');
      const shouldReadBody =
        method === 'GET' &&
        (contentType === null || READABLE_CONTENT_TYPE_PATTERN.test(contentType));
      const body = shouldReadBody ? await readCappedBody(response) : null;

      if (!shouldReadBody) {
        await response.body?.cancel();
      }

      return {
        url: currentUrl,
        statusCode: response.status,
        responseTimeMs: Date.now() - startedAt,
        contentType,
        xRobotsTag: response.headers.get('x-robots-tag'),
        body,
        errorMessage: null,
      };
    }

    throw new Error('Too many redirects');
  } catch (error) {
    return {
      url: currentUrl,
      statusCode: 0,
      responseTimeMs: Date.now() - startedAt,
      contentType: null,
      xRobotsTag: null,
      body: null,
      errorMessage: error instanceof Error ? error.message : 'Fetch failed',
    };
  }
};
