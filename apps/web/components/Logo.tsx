'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

export function Logo() {
  const t = useTranslations('common');

  return (
    <Link
      href="/"
      className={[
        'font-display text-xl font-semibold tracking-tight text-foreground',
        'transition-opacity duration-300 hover:opacity-70',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-warm rounded-sm',
      ].join(' ')}
    >
      {t('siteName')}
    </Link>
  );
}
