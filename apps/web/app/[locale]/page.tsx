import { setRequestLocale } from 'next-intl/server';

import { HomeExperience, type HomeHeroPhoto } from '@/components/HomeExperience';
import { getCurrentUser } from '@/lib/auth';
import { getDaysForMonth, getLatestPhoto } from '@/lib/queries';

export const revalidate = 60;

type Params = { locale: string };

function getMadridDateString(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function getMadridDateParts(date: Date): { today: string; year: number; month: number } {
  const today = getMadridDateString(date);
  const [yearPart, monthPart] = today.split('-');
  const year = Number(yearPart);
  const month = Number(monthPart);

  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    throw new Error(`Could not derive Madrid date parts from ${today}`);
  }

  return { today, year, month };
}

export default async function HomePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const now = new Date();
  const { today, year, month } = getMadridDateParts(now);

  const [days, latestPhoto, user] = await Promise.all([
    getDaysForMonth(year, month),
    getLatestPhoto(),
    getCurrentUser(),
  ]);
  const isAuthenticated = user !== null;
  const todayWithPhoto = days.find((day) => day.date === today && day.best_photo);
  const heroPhoto: HomeHeroPhoto | null = todayWithPhoto?.best_photo?.resolved_url
    ? {
        date: todayWithPhoto.date,
        photoUrl: todayWithPhoto.best_photo.resolved_url,
        capturedAt: todayWithPhoto.best_photo.captured_at,
        isToday: true,
      }
    : latestPhoto?.resolved_url
      ? {
          date: latestPhoto.day_date,
          photoUrl: latestPhoto.resolved_url,
          capturedAt: latestPhoto.captured_at,
          isToday: latestPhoto.day_date === today,
        }
      : null;

  return (
    <HomeExperience
      photo={heroPhoto}
      days={days}
      year={year}
      month={month}
      isAuthenticated={isAuthenticated}
    />
  );
}
