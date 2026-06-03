'use client';

import { useFormatter } from 'next-intl';

import { parseDateString } from '@/lib/utils';

type DayDateHeadingProps = {
  date: string;
};

export function DayDateHeading({ date }: DayDateHeadingProps) {
  const format = useFormatter();

  return (
    <time dateTime={date}>
      {format.dateTime(parseDateString(date), {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Europe/Madrid',
      })}
    </time>
  );
}
