import { ArrowLeft } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { DayDetail } from '@/components/DayDetail';
import { Link } from '@/i18n/navigation';
import { requireCurrentUser } from '@/lib/auth';

export const revalidate = 60;

type Params = { locale: string; date: string };

export default async function DayPage({ params }: { params: Promise<Params> }) {
  const { locale, date } = await params;
  setRequestLocale(locale);
  await requireCurrentUser(locale);

  const t = await getTranslations('day');
  const [year, month] = date.split('-');

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href={`/${year}/${month}`}
        className="mb-8 inline-flex items-center gap-1.5 font-mono text-sm text-foreground-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-warm"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        {t('back')}
      </Link>
      <DayDetail date={date} />
    </div>
  );
}
