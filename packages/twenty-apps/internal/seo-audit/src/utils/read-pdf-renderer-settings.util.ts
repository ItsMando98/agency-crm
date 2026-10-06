import {
  PDF_RENDERER_API_KEY_VARIABLE_KEY,
  PDF_RENDERER_URL_VARIABLE_KEY,
} from 'src/constants/application-variable-keys.const';
import { type PdfRendererSettings } from 'src/types/pdf-renderer-settings';

export const readPdfRendererSettings = (
  environment: Record<string, string | undefined> = process.env,
): PdfRendererSettings | null => {
  const rawUrl = environment[PDF_RENDERER_URL_VARIABLE_KEY]?.trim();
  const apiKey = environment[PDF_RENDERER_API_KEY_VARIABLE_KEY]?.trim();

  if (rawUrl === undefined || rawUrl === '') {
    return null;
  }

  try {
    const url = new URL(rawUrl);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }

    return {
      url: url.toString().replace(/\/+$/, ''),
      apiKey: apiKey === undefined || apiKey === '' ? null : apiKey,
    };
  } catch {
    return null;
  }
};
