'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useFormatter, useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { cn, parseDateString } from '@/lib/utils';
import { PhotoImage } from './PhotoImage';

type DayCellProps = {
  date: string;
  photoUrl: string | null;
  isToday: boolean;
  isFuture: boolean;
  index: number;
  isTeaser?: boolean;
};

export function DayCell({
  date,
  photoUrl,
  isToday,
  isFuture,
  index,
  isTeaser = false,
}: DayCellProps) {
  const t = useTranslations('calendar');
  const format = useFormatter();
  const prefersReducedMotion = useReducedMotion();
  const hasPhoto = photoUrl !== null && !isFuture;
  const isLocked = isTeaser && hasPhoto && !isToday;
  const canOpen = hasPhoto && !isTeaser;
  const parsedDate = parseDateString(date);

  const cellVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: index * 0.03,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };

  const inner = (
    <motion.div
      variants={cellVariants}
      whileHover={
        hasPhoto && !prefersReducedMotion
          ? { scale: 1.03, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }
          : undefined
      }
      className={cn(
        'relative aspect-square w-full overflow-hidden rounded-lg',
        'border border-border/50 transition-all duration-300',
        hasPhoto && 'bg-surface',
        canOpen && 'shadow-sm hover:-translate-y-0.5 hover:shadow-md cursor-pointer',
        isToday &&
          'border-accent-warm/70 ring-2 ring-accent-warm/20 ring-offset-2 ring-offset-background',
        !hasPhoto && 'bg-gradient-to-br from-accent-warm/10 via-surface to-transparent',
      )}
    >
      {hasPhoto && photoUrl ? (
        <PhotoImage
          src={photoUrl}
          alt={t('dayAriaLabel', {
            date: format.dateTime(parsedDate, {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              timeZone: 'Europe/Madrid',
            }),
          })}
          fill
          sizes="(max-width: 767px) 25vw, (max-width: 1023px) 20vw, (max-width: 1279px) 16.6vw, 14.2vw"
          className={cn(
            'object-cover transition-transform duration-500',
            isLocked && 'blur-sm scale-105 saturate-75',
          )}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-xl text-foreground-muted/45">
            {format.dateTime(parsedDate, { day: 'numeric', timeZone: 'Europe/Madrid' })}
          </span>
        </div>
      )}

      {isLocked ? (
        <Link
          href={`/login?next=${encodeURIComponent('/')}`}
          className="absolute inset-0 flex items-center justify-center bg-black/25 px-2 text-center font-mono text-[10px] font-medium uppercase tracking-wide text-white transition-colors hover:bg-black/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-warm"
        >
          {t('loginToView')}
        </Link>
      ) : null}

      <span
        className={cn(
          'absolute bottom-1.5 right-2 rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums select-none',
          'transition-opacity duration-200',
          hasPhoto ? 'bg-black/25 text-white/75 opacity-75' : 'text-foreground-muted/50',
        )}
        aria-hidden="true"
      >
        {format.dateTime(parsedDate, { day: 'numeric', timeZone: 'Europe/Madrid' })}
      </span>
    </motion.div>
  );

  if (!canOpen) return inner;

  return (
    <Link
      data-calendar-cell
      href={`/day/${date}`}
      aria-label={t('dayAriaLabel', {
        date: format.dateTime(parsedDate, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'Europe/Madrid',
        }),
      })}
      className="group block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-warm focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {inner}
    </Link>
  );
}
