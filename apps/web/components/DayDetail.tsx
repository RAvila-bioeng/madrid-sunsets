import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { getCurrentUser, isAdmin } from '@/lib/auth';
import { type PhotoWithResolvedUrl, resolveServerPhotoUrls } from '@/lib/photos.server';
import { getDay } from '@/lib/queries';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { DayDateHeading } from './DayDateHeading';
import { DayMeta } from './DayMeta';
import { DayNote } from './DayNote';
import { DayPageClient } from './DayPageClient';
import { EmptyState } from './EmptyState';

type DayDetailProps = {
  date: string;
};

function hasResolvedUrl(photo: PhotoWithResolvedUrl): photo is PhotoWithResolvedUrl & {
  storage_path: string;
} {
  return photo.storage_path !== null;
}

export async function DayDetail({ date }: DayDetailProps) {
  const t = await getTranslations('day');

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    notFound();
  }

  let result: Awaited<ReturnType<typeof getDay>> | null = null;
  try {
    result = await getDay(date);
  } catch {
    notFound();
  }

  const { day, photos } = result;
  const resolvedPhotos = (await resolveServerPhotoUrls(createServiceRoleClient(), photos)).filter(
    hasResolvedUrl,
  );
  const bestPhoto = resolvedPhotos.find((p) => p.is_best_of_day) ?? resolvedPhotos[0];

  const user = await getCurrentUser();
  const admin = user !== null && !!user.email && isAdmin(user.email);

  return (
    <div className="flex flex-col gap-8">
      <div className="mx-auto flex max-w-2xl flex-col gap-3 text-center">
        <h1 className="font-display text-4xl font-semibold text-foreground">
          <DayDateHeading date={day.date} />
        </h1>
        <div className="flex justify-center">
          <DayMeta day={day} />
        </div>
        <div className="mx-auto max-w-md">
          <DayNote note={day.note} />
        </div>
      </div>

      {resolvedPhotos.length === 0 || !bestPhoto ? (
        <EmptyState title={t('empty.title')} description={t('empty.description')} />
      ) : (
        <DayPageClient
          photos={resolvedPhotos}
          initialPhotoId={bestPhoto.id}
          isAdmin={admin}
          date={date}
        />
      )}
    </div>
  );
}
