const IGNORED_CLIENT_ERROR_STATUS_CODES = [401, 403, 429];

export const isBrokenStatusCode = (statusCode: number): boolean =>
  statusCode >= 400 &&
  statusCode < 500 &&
  !IGNORED_CLIENT_ERROR_STATUS_CODES.includes(statusCode);
