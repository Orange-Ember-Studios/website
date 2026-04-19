import { SITE_URLS } from '../constants/urls';

/**
 * Resolves an image path to its full URL.
 * If the path starts with http/https, it is returned as is.
 * If the path starts with a slash, it is prepended with the CDN_BASE.
 * otherwise, it is treated as a relative path and prepended with the CDN_BASE.
 */
export function resolveImageUrl(path: string | undefined | null): string {
  if (!path) return '';
  
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Ensure path starts with a slash for consistent joining
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${SITE_URLS.CDN_BASE}${normalizedPath}`;
}
