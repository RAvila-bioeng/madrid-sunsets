import { createClient } from './supabase/client';

const ABSOLUTE_URL_PATTERN = /^https:\/\//;
const BEST_PHOTOS_BUCKET = 'sunsets-best';

export function resolvePhotoUrl(storagePath: string): string | null {
  if (ABSOLUTE_URL_PATTERN.test(storagePath)) {
    return storagePath;
  }

  if (!storagePath.endsWith('best.jpg')) {
    return null;
  }

  return createClient().storage.from(BEST_PHOTOS_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}
