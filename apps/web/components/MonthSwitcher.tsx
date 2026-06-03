'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';

import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const PROJECT_START = { year: 2026, month: 4 };

type MonthSwitcherProps = {
  year: number;
  month: number;
};

export function MonthSwitcher({ year, month }: MonthSwitcherProps) {
  const router = useRouter();
  const t = useTranslations('calendar');
  const format = useFormatter();
  const now = new Date();

  const isAtStart = year === PROJECT_START.year && month === PROJECT_START.month;
  const isAtFuture =
    year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);

  function navigate(dir: -1 | 1) {
    let m = month + dir;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    router.push(`/${y}/${String(m).padStart(2, '0')}`);
  }

  const monthName = format.dateTime(new Date(year, month - 1, 1, 12), {
    month: 'long',
    timeZone: 'Europe/Madrid',
  });

  return (
    <div className="flex items-center justify-between gap-4 rounded-full border border-border/70 bg-background/70 px-2 py-1.5 shadow-sm">
      <button
        type="button"
        onClick={() => navigate(-1)}
        disabled={isAtStart}
        aria-label={t('previous')}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-warm',
          isAtStart
            ? 'text-foreground-muted/30 cursor-not-allowed'
            : 'text-foreground-muted hover:bg-surface hover:text-foreground',
        )}
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>

      <h2 className="min-w-32 text-center font-display text-xl font-semibold text-foreground tabular-nums sm:text-2xl">
        {monthName} {year}
      </h2>

      <button
        type="button"
        onClick={() => navigate(1)}
        disabled={isAtFuture}
        aria-label={t('next')}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-warm',
          isAtFuture
            ? 'text-foreground-muted/30 cursor-not-allowed'
            : 'text-foreground-muted hover:bg-surface hover:text-foreground',
        )}
      >
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
