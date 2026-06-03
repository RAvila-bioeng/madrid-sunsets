import type { Database } from '@sunset/shared';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

import { routing } from '@/i18n/routing';
import { getSafeNextPath } from '@/lib/auth-callback';

type RouteContext = {
  params: Promise<{ locale: string }>;
};

function localizedPath(locale: string, path: string): string {
  return locale === routing.defaultLocale ? path : `/${locale}${path}`;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { locale } = await context.params;
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = getSafeNextPath(requestUrl.searchParams.get('next'));

  if (code) {
    const destination = new URL(next, requestUrl.origin);
    destination.searchParams.set('welcome', '1');
    const response = NextResponse.redirect(destination);

    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/rest\/v1\/?$/, '');
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

    const supabase = createServerClient<Database>(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }
  }

  return NextResponse.redirect(
    new URL(`${localizedPath(locale, '/login')}?error=link_expired`, requestUrl.origin),
  );
}
