import * as Linking from 'expo-linking';
import { router, type Href } from 'expo-router';

const ALLOWED_STATIC_PATHS = new Set([
  '/',
  '/component',
  '/showcase',
  '/me',
  '/refer',
  '/paywall',
  '/permissions',
]);

// In these schemes the host is a server, not part of the route.
const SERVER_HOST_SCHEMES = new Set(['http', 'https', 'exp', 'exps']);

// WHATWG URL parsing puts `paywall` of `scheme://paywall` in the hostname, so custom-scheme
// links need the host as the first route segment (`scheme:///paywall` has an empty host).
function routePathFromParsedUrl({ scheme, hostname, path }: Linking.ParsedURL) {
  const hostSegment = scheme && !SERVER_HOST_SCHEMES.has(scheme.toLowerCase()) ? hostname : null;
  return [hostSegment, path].filter(Boolean).join('/');
}

function normalizePath(path: string | null | undefined) {
  const cleanPath = `/${(path ?? '').replace(/^\/+/, '').replace(/^--\//, '')}`;
  if (cleanPath === '/--') return '/';
  return cleanPath.replace(/\/$/, '') || '/';
}

function toQueryString(params: Record<string, unknown> | null | undefined) {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === 'string' && value.trim()) {
      searchParams.set(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export function createAppLink(path: string, queryParams?: Record<string, string>) {
  const domain = process.env.EXPO_PUBLIC_LINKING_DOMAIN?.trim();
  const normalizedPath = normalizePath(path);

  if (domain) {
    const query = toQueryString(queryParams);
    return `https://${domain}${normalizedPath}${query}`;
  }

  return Linking.createURL(normalizedPath, { queryParams });
}

export function resolveDeepLinkHref(url: string): Href | null {
  const parsed = Linking.parse(url);
  const routeParam = parsed.queryParams?.route;
  const path = normalizePath(
    typeof routeParam === 'string' ? routeParam : routePathFromParsedUrl(parsed)
  );
  const query = toQueryString(parsed.queryParams);

  if (ALLOWED_STATIC_PATHS.has(path)) {
    return `${path}${query}` as Href;
  }

  return null;
}

export function openDeepLink(url: string, fallback: Href = '/') {
  const href = resolveDeepLinkHref(url) ?? fallback;
  router.push(href);
}
