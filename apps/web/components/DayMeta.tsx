'use client';

import { useFormatter, useLocale, useTranslations } from 'next-intl';

import type { Day } from '@sunset/shared';

import { parseDateString } from '@/lib/utils';

type DayMetaProps = {
  day: Day;
};

function extractWeatherSummary(weather: Day['weather_summary']): string | null {
  if (!weather || typeof weather !== 'object' || Array.isArray(weather)) return null;
  const record = weather as Record<string, unknown>;
  const val = record.summary;
  return typeof val === 'string' ? val : null;
}

export function DayMeta({ day }: DayMetaProps) {
  const t = useTranslations('day');
  const locale = useLocale();
  const format = useFormatter();
  const weather = extractWeatherSummary(day.weather_summary);

  return (
    <dl className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground-muted">
      <div className="flex items-center gap-1.5">
        <dt className="font-mono text-xs uppercase tracking-widest opacity-50">{t('meta.date')}</dt>
        <dd>
          <time dateTime={day.date}>
            {format.dateTime(parseDateString(day.date), {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              timeZone: 'Europe/Madrid',
            })}
          </time>
        </dd>
      </div>

      <div className="flex items-center gap-1.5">
        <dt className="font-mono text-xs uppercase tracking-widest opacity-50">
          {t('meta.sunset')}
        </dt>
        <dd className="font-mono">
          {format.dateTime(new Date(day.sunset_at), {
            hour: locale === 'en' ? 'numeric' : '2-digit',
            minute: '2-digit',
            hour12: locale === 'en',
            timeZone: 'Europe/Madrid',
          })}
        </dd>
      </div>

      {weather && (
        <div className="flex items-center gap-1.5">
          <dt className="font-mono text-xs uppercase tracking-widest opacity-50">
            {t('meta.weather')}
          </dt>
          <dd>{weather}</dd>
        </div>
      )}
    </dl>
  );
}
