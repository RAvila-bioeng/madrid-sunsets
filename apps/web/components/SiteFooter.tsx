'use client';

import { useTranslations } from 'next-intl';

export function SiteFooter() {
  const t = useTranslations('common');
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 sm:mt-24 border-t border-border py-8 text-center">
      <p className="text-xs text-foreground-muted font-mono">{t('footer', { year })}</p>
    </footer>
  );
}
