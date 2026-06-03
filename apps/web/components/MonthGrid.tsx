'use client';

import { eachDayOfInterval, endOfMonth, format, isAfter, isToday, startOfMonth } from 'date-fns';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';

import type { DayWithBestPhoto } from '@/lib/queries';

import { DayCell } from './DayCell';

type MonthGridProps = {
  year: number;
  month: number;
  days: DayWithBestPhoto[];
  variant?: 'full' | 'teaser';
};

export function MonthGrid({ year, month, days, variant = 'full' }: MonthGridProps) {
  const t = useTranslations('calendar');
  const prefersReducedMotion = useReducedMotion();
  const gridRef = useRef<HTMLUListElement>(null);

  const monthDate = new Date(year, month - 1, 1);
  const allDates = eachDayOfInterval({
    start: startOfMonth(monthDate),
    end: endOfMonth(monthDate),
  });

  const daysByDate = new Map(days.map((d) => [d.date, d]));
  const now = new Date();

  function onKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
    const cells = Array.from(
      gridRef.current?.querySelectorAll<HTMLElement>('[data-calendar-cell]') ?? [],
    );
    const current = document.activeElement as HTMLElement;
    const idx = cells.indexOf(current);
    if (idx === -1) return;

    const w = window.innerWidth;
    const cols = w >= 1280 ? 7 : w >= 1024 ? 6 : w >= 768 ? 5 : 4;

    const directions: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: cols,
      ArrowUp: -cols,
    };
    const delta = directions[e.key];
    if (delta === undefined) return;

    e.preventDefault();
    const next = idx + delta;
    if (next >= 0 && next < cells.length) cells[next]?.focus();
  }

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.03 } },
  };

  return (
    <motion.ul
      ref={gridRef}
      aria-label={t('gridAriaLabel')}
      variants={containerVariants}
      initial="hidden"
      animate="show"
      onKeyDown={onKeyDown}
      className="grid list-none grid-cols-4 gap-2 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7"
    >
      {allDates.map((date, i) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const day = daysByDate.get(dateStr);
        const photoUrl = day?.best_photo?.resolved_url ?? null;

        return (
          <li key={dateStr}>
            <DayCell
              date={dateStr}
              photoUrl={photoUrl}
              isToday={isToday(date)}
              isFuture={isAfter(date, now)}
              index={i}
              isTeaser={variant === 'teaser'}
            />
          </li>
        );
      })}
    </motion.ul>
  );
}
