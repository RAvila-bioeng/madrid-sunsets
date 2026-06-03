import type { Database } from '@sunset/shared';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

function getSupabaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/rest\/v1\/?$/, '');
}

export async function createClient() {
  const cookieStore = await cookies();
  // Strip any /rest/v1/ suffix — the client needs the bare project URL
  const url = getSupabaseUrl();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // No-op when called from a Server Component — mutation not allowed there
        }
      },
    },
  });
}

export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    getSupabaseUrl(),
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    {
      auth: {
        persistSession: false,
      },
    },
  );
}
