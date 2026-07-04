/**
 * Safely extracts a single string from an Express route param
 * which may be string | string[] in Express 5.
 */
export const getParam = (param: string | string[]): string =>
  Array.isArray(param) ? param[0] : param;
