'use client';

import type { Database } from '@sunset/shared';
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/rest\/v1\/?$/, '');
  return createBrowserClient<Database>(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '');
}
