import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';

import { routing } from './i18n/routing';
import { copyResponseCookies, updateSession } from './lib/supabase/proxy';

const handleI18n = createMiddleware(routing);

const PROTECTED_ROUTES = [/^\/day\/[^/]+$/, /^\/live\/?$/, /^\/\d{4}\/\d{2}\/?$/];

function getLocaleAwarePath(pathname: string): { locale: string; path: string } {
  const [, maybeLocale, ...rest] = pathname.split('/');
  const locale = routing.locales.includes(maybeLocale as (typeof routing.locales)[number])
    ? maybeLocale
    : routing.defaultLocale;

  if (locale === maybeLocale) {
    return { locale, path: `/${rest.join('/')}`.replace(/\/$/, '') || '/' };
  }

  return { locale, path: pathname.replace(/\/$/, '') || '/' };
}

function isProtectedPath(pathname: string): boolean {
  const { path } = getLocaleAwarePath(pathname);
  return PROTECTED_ROUTES.some((route) => route.test(path));
}

function getLoginPath(request: NextRequest): string {
  const { locale } = getLocaleAwarePath(request.nextUrl.pathname);
  const loginPath = locale === routing.defaultLocale ? '/login' : `/${locale}/login`;
  const next = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const url = request.nextUrl.clone();

  url.pathname = loginPath;
  url.search = '';
  url.searchParams.set('next', next);

  return url.toString();
}

export default async function proxy(request: NextRequest) {
  const { response: authResponse, user } = await updateSession(request);

  if (isProtectedPath(request.nextUrl.pathname) && !user) {
    return copyResponseCookies(authResponse, NextResponse.redirect(getLoginPath(request)));
  }

  return copyResponseCookies(authResponse, handleI18n(request));
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
