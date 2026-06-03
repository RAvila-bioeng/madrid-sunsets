'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { LocaleSwitcher } from './LocaleSwitcher';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

type SiteHeaderProps = {
  userEmail: string | null;
};

export function SiteHeader({ userEmail }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations('nav');

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 16);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between px-4 sm:px-6 transition-all duration-400',
        scrolled && 'border-b border-border/60 backdrop-blur-md bg-background/80',
      )}
    >
      <Logo />
      <div className="flex items-center gap-3">
        <LocaleSwitcher />
        <ThemeToggle />
        {userEmail ? (
          <UserMenu email={userEmail} />
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center rounded-full px-4 py-3 text-sm font-medium text-foreground-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-warm"
          >
            {t('login')}
          </Link>
        )}
      </div>
    </header>
  );
}
