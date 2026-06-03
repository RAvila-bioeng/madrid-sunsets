'use client';

import { LogOut } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';

type UserMenuProps = {
  email: string;
};

function signOutPath(locale: string): string {
  return locale === routing.defaultLocale ? '/auth/signout' : `/${locale}/auth/signout`;
}

export function UserMenu({ email }: UserMenuProps) {
  const t = useTranslations('auth.menu');
  const locale = useLocale();
  const initial = email.slice(0, 1).toUpperCase();

  return (
    <div className="group relative flex items-center">
      <button
        type="button"
        aria-label={t('label')}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-rose/20 font-mono text-xs font-semibold text-foreground ring-1 ring-accent-rose/30 transition-colors hover:bg-accent-rose/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-warm"
      >
        {initial}
      </button>

      <div
        className={cn(
          'pointer-events-none absolute right-0 top-10 z-50 min-w-52 translate-y-1 rounded-lg border border-border bg-surface p-2 opacity-0 shadow-lg transition-all duration-200',
          'group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100',
        )}
      >
        <p className="truncate px-2 py-1.5 text-xs text-foreground-muted">{email}</p>
        <form action={signOutPath(locale)} method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent-warm/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-warm"
          >
            <LogOut size={14} aria-hidden="true" />
            {t('signOut')}
          </button>
        </form>
      </div>
    </div>
  );
}
