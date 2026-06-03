import type { User } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

import { routing } from '@/i18n/routing';
import { createClient } from './supabase/server';

export const NEXT_LOCALE_COOKIE = 'NEXT_LOCALE';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isAllowedUser(user: User | null): user is User {
  if (!user?.email) return false;
  const recipients =
    process.env.RECIPIENT_EMAILS?.split(',')
      .map((e) => e.trim())
      .filter(Boolean) ?? [];
  const allowed = [process.env.ADMIN_EMAIL, ...recipients].filter(Boolean);
  return allowed.includes(user.email);
}

export function isAdmin(email: string): boolean {
  return !!process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL;
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return isAllowedUser(user) ? user : null;
}

export async function requireCurrentUser(locale: string): Promise<User> {
  const user = await getCurrentUser();
  if (user) return user;

  redirect(locale === routing.defaultLocale ? '/login' : `/${locale}/login`);
}
