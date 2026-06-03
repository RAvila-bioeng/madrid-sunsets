import type { Day, Photo } from '@sunset/shared';

import { resolveServerPhotoUrl } from './photos.server';
import { createClient, createServiceRoleClient } from './supabase/server';

/** Day row joined with the best photo's storage_path (null when no best photo). */
type BestPhotoForDay = Pick<Photo, 'captured_at' | 'is_best_of_day' | 'storage_path'>;

export type DayWithBestPhoto = Day & {
  best_photo:
    | (BestPhotoForDay & {
        resolved_url: string | null;
      })
    | null;
};

export type LatestPhoto = Photo & {
  resolved_url: string | null;
};

export async function getDaysForMonth(year: number, month: number): Promise<DayWithBestPhoto[]> {
  const supabase = await createClient();
  const m = String(month).padStart(2, '0');
  // Use strict-less-than against the first day of the next month to avoid invalid dates (e.g. April 31)
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const nextM = String(nextMonth).padStart(2, '0');

  const { data, error } = await supabase
    .from('days')
    .select(
      '*, best_photo:photos!days_best_photo_id_fkey(storage_path, captured_at, is_best_of_day)',
    )
    .gte('date', `${year}-${m}-01`)
    .lt('date', `${nextYear}-${nextM}-01`)
    .order('date');

  if (error) throw error;

  const serviceRoleSupabase = createServiceRoleClient();
  const days = data as (Day & { best_photo: BestPhotoForDay | null })[];

  return Promise.all(
    days.map(async (day) => ({
      ...day,
      best_photo: day.best_photo
        ? {
            ...day.best_photo,
            resolved_url: await resolveServerPhotoUrl(serviceRoleSupabase, day.best_photo),
          }
        : null,
    })),
  );
}

export async function getDay(date: string): Promise<{ day: Day; photos: Photo[] }> {
  const supabase = await createClient();
  const serviceRoleSupabase = createServiceRoleClient();

  const [dayResult, photosResult] = await Promise.all([
    supabase.from('days').select('*').eq('date', date).single(),
    serviceRoleSupabase.from('photos').select('*').eq('day_date', date).order('captured_at'),
  ]);

  if (dayResult.error) throw dayResult.error;
  if (photosResult.error) throw photosResult.error;

  return { day: dayResult.data, photos: photosResult.data };
}

export async function getCurrentMonthDays(): Promise<DayWithBestPhoto[]> {
  const now = new Date();
  return getDaysForMonth(now.getFullYear(), now.getMonth() + 1);
}

export async function getLatestPhoto(): Promise<LatestPhoto | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('is_best_of_day', true)
    .order('captured_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    ...data,
    resolved_url: await resolveServerPhotoUrl(createServiceRoleClient(), data),
  };
}
