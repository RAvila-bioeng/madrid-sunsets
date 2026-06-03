'use client';

import { useLocale } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const LOCALES = ['es', 'en'] as const;
const ONE_YEAR = 60 * 60 * 24 * 365;

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(nextLocale: (typeof LOCALES)[number]) {
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=${ONE_YEAR}; SameSite=Lax`;
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5">
      {LOCALES.map((item) => {
        const isActive = item === locale;
        return (
          <button
            key={item}
            type="button"
            aria-pressed={isActive}
            onClick={() => switchLocale(item)}
            className={cn(
              'h-9 rounded-md px-3 font-mono text-[11px] font-medium uppercase transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-warm',
              isActive
                ? 'bg-accent-warm text-white'
                : 'text-foreground-muted hover:text-foreground',
            )}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}
