'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarDays, Image as ImageIcon } from 'lucide-react';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { Link } from '@/i18n/navigation';
import type { DayWithBestPhoto } from '@/lib/queries';
import { cn, parseDateString } from '@/lib/utils';
import { EmptyState } from './EmptyState';
import { MonthGrid } from './MonthGrid';
import { MonthSwitcher } from './MonthSwitcher';
import { PhotoImage } from './PhotoImage';

export type HomeHeroPhoto = {
  date: string;
  photoUrl: string;
  capturedAt: string;
  isToday: boolean;
};

type HomeExperienceProps = {
  photo: HomeHeroPhoto | null;
  days: DayWithBestPhoto[];
  year: number;
  month: number;
  isAuthenticated: boolean;
};

type ActivePanel = 'today' | 'archive';

const panelTransition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

export function HomeExperience({ photo, days, year, month, isAuthenticated }: HomeExperienceProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>('today');
  const t = useTranslations('home');
  const locale = useLocale();
  const format = useFormatter();
  const prefersReducedMotion = useReducedMotion();

  const date = photo ? parseDateString(photo.date) : null;
  const formattedDate = date
    ? format.dateTime(date, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Europe/Madrid',
      })
    : null;
  const capturedTime = photo
    ? format.dateTime(new Date(photo.capturedAt), {
        hour: locale === 'en' ? 'numeric' : '2-digit',
        minute: '2-digit',
        hour12: locale === 'en',
        timeZone: 'Europe/Madrid',
      })
    : null;

  function panelButton(panel: ActivePanel, icon: typeof ImageIcon, label: string) {
    const Icon = icon;
    const isActive = activePanel === panel;

    return (
      <button
        type="button"
        role="tab"
        aria-selected={isActive}
        onClick={() => setActivePanel(panel)}
        className={cn(
          'relative flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-warm focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          isActive ? 'text-background' : 'text-foreground-muted hover:text-foreground',
        )}
      >
        {isActive ? (
          <motion.span
            layoutId="home-active-tab"
            className="absolute inset-0 rounded-full bg-foreground"
            transition={panelTransition}
          />
        ) : null}
        <Icon size={16} aria-hidden="true" className="relative" />
        <span className="relative">{label}</span>
      </button>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent-warm">
            {t('app.eyebrow')}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            {t('app.title')}
          </h1>
        </div>

        <div
          role="tablist"
          aria-label={t('tabs.label')}
          className="flex w-fit items-center gap-1 rounded-full border border-border/70 bg-surface/75 p-1 shadow-sm"
        >
          {panelButton('today', ImageIcon, t('tabs.today'))}
          {panelButton('archive', CalendarDays, t('tabs.archive'))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border/70 bg-surface/70 p-3 shadow-[0_22px_70px_rgba(28,25,23,0.10)] sm:p-4">
        <AnimatePresence mode="wait">
          {activePanel === 'today' ? (
            <motion.div
              key="today"
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -8 }}
              transition={prefersReducedMotion ? { duration: 0 } : panelTransition}
              role="tabpanel"
              className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:items-stretch"
            >
              <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-background p-2 shadow-sm transition-transform duration-300 hover:-translate-y-0.5">
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-gradient-to-br from-accent-gold/16 via-surface to-accent-rose/12">
                  {photo ? (
                    <PhotoImage
                      src={photo.photoUrl}
                      alt={t('today.photoAlt', { date: formattedDate ?? '' })}
                      fill
                      sizes="(max-width: 1023px) 100vw, 68vw"
                      priority
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.015]"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
                      <p className="max-w-sm font-display text-2xl text-foreground-muted">
                        {t('today.emptyCard')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-between gap-8 rounded-2xl border border-border/60 bg-background/65 p-4 sm:p-8">
                <div className="flex flex-col gap-4">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent-warm">
                    {photo?.isToday ? t('today.eyebrowToday') : t('today.eyebrowLatest')}
                  </p>
                  <div className="flex flex-col gap-3">
                    <h2 className="font-display text-4xl font-semibold leading-tight text-foreground">
                      {photo
                        ? t(photo.isToday ? 'today.titleToday' : 'today.titleLatest')
                        : t('today.titleEmpty')}
                    </h2>
                    <p className="text-sm leading-6 text-foreground-muted">
                      {photo
                        ? t(photo.isToday ? 'today.descriptionToday' : 'today.descriptionLatest')
                        : t('today.descriptionEmpty')}
                    </p>
                  </div>

                  {photo && formattedDate ? (
                    <div className="grid gap-2 rounded-xl border border-border/70 bg-surface/70 p-4 font-mono text-xs text-foreground-muted">
                      <span>{formattedDate}</span>
                      {capturedTime ? (
                        <span>{t('today.capturedAt', { time: capturedTime })}</span>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-3">
                  {photo ? (
                    <Link
                      href={
                        isAuthenticated
                          ? `/day/${photo.date}`
                          : `/login?next=${encodeURIComponent(`/day/${photo.date}`)}`
                      }
                      className="group inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-accent-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-warm focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {t(isAuthenticated ? 'today.view' : 'today.login')}
                      <ArrowRight
                        size={16}
                        aria-hidden="true"
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setActivePanel('archive')}
                    className="inline-flex h-11 items-center rounded-full border border-border px-4 text-sm font-medium text-foreground-muted transition-colors hover:border-accent-warm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-warm focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {t('today.archive')}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="archive"
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -8 }}
              transition={prefersReducedMotion ? { duration: 0 } : panelTransition}
              role="tabpanel"
              className="rounded-2xl border border-border/60 bg-background/65 p-4 sm:p-6"
            >
              <div className="mb-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div className="max-w-xl">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent-warm">
                    {t('archive.eyebrow')}
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-semibold text-foreground">
                    {t(isAuthenticated ? 'archive.recipientTitle' : 'archive.publicTitle')}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-foreground-muted">
                    {t(
                      isAuthenticated
                        ? 'archive.recipientDescription'
                        : 'archive.publicDescription',
                    )}
                  </p>
                </div>
                <MonthSwitcher year={year} month={month} />
              </div>

              {days.length === 0 ? (
                <EmptyState title={t('empty.title')} description={t('empty.description')} />
              ) : (
                <MonthGrid
                  year={year}
                  month={month}
                  days={days}
                  variant={isAuthenticated ? 'full' : 'teaser'}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
