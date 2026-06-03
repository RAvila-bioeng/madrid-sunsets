import { routing } from '../i18n/routing';

export function getSafeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/';
  return next;
}

function normalizeSiteUrl(value: string | undefined): string | null {
  const trimmed = value?.trim().replace(/\/$/, '');
  if (!trimmed) return null;
  return trimmed.startsWith('http://') || trimmed.startsWith('https://')
    ? trimmed
    : `https://${trimmed}`;
}

export function getSiteUrl(): string {
  return (
    normalizeSiteUrl(process.env.SITE_URL) ??
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeSiteUrl(process.env.VERCEL_URL) ??
    'http://localhost:3000'
  );
}

export function getAuthCallbackUrl(locale: string, next: string | null | undefined): string {
  const callbackPath =
    locale === routing.defaultLocale ? '/auth/callback' : `/${locale}/auth/callback`;
  const url = new URL(callbackPath, getSiteUrl());
  url.searchParams.set('next', getSafeNextPath(next));
  return url.toString();
}
