import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { EmptyState } from '@/components/EmptyState';
import { MonthGrid } from '@/components/MonthGrid';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { requireCurrentUser } from '@/lib/auth';
import { getDaysForMonth } from '@/lib/queries';

export const revalidate = 60;

type Params = { locale: string; year: string; month: string };

export default async function MonthPage({ params }: { params: Promise<Params> }) {
  const { locale, year: yearStr, month: monthStr } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('calendar');
  await requireCurrentUser(locale);

  const year = Number(yearStr);
  const month = Number(monthStr);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12 ||
    year < 2026
  ) {
    notFound();
  }

  const days = await getDaysForMonth(year, month);

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <MonthSwitcher year={year} month={month} />
      </div>

      {days.length === 0 ? (
        <EmptyState title={t('empty.title')} description={t('empty.description')} />
      ) : (
        <MonthGrid year={year} month={month} days={days} />
      )}
    </div>
  );
}
