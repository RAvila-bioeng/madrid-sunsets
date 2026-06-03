import type { Database } from '@sunset/shared';
import { createServerClient } from '@supabase/ssr';
import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

import { routing } from '@/i18n/routing';

type RouteContext = {
  params: Promise<{ locale: string }>;
};

function localizedHome(locale: string): string {
  return locale === routing.defaultLocale ? '/' : `/${locale}`;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { locale } = await context.params;
  const response = NextResponse.redirect(new URL(localizedHome(locale), request.url), {
    status: 303,
  });

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

  await supabase.auth.signOut();
  revalidatePath('/', 'layout');

  return response;
}
