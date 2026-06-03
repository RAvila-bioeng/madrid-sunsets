import type { Photo } from '@sunset/shared';
import { unstable_cache } from 'next/cache';

const HTTPS_URL_PATTERN = /^https:\/\//;
const BEST_PHOTOS_BUCKET = 'sunsets-best';
const RAW_PHOTOS_BUCKET = 'sunsets-raw';
const SIGNED_URL_CACHE_SECONDS = 50 * 60;
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export type StorageUrlClient = {
  storage: {
    from(bucket: string): {
      getPublicUrl(storagePath: string): { data: { publicUrl: string } };
      createSignedUrl(
        storagePath: string,
        expiresIn: number,
      ): Promise<{ data: { signedUrl: string } | null; error: Error | null }>;
    };
  };
};

export type PhotoWithResolvedUrl = Omit<Photo, 'storage_path'> & {
  storage_path: string | null;
};

type ServerPhotoUrlInput = Pick<Photo, 'is_best_of_day' | 'storage_path'>;
type SignedUrlResolver = (storagePath: string) => Promise<string | null>;

function createCachedSignedUrlResolver(supabase: StorageUrlClient): SignedUrlResolver {
  return unstable_cache(
    async (storagePath: string): Promise<string | null> => {
      try {
        const { data, error } = await supabase.storage
          .from(RAW_PHOTOS_BUCKET)
          .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);

        if (error || !data) {
          console.error(
            '[photos.server] createSignedUrl error:',
            error,
            'data:',
            data,
            'path:',
            storagePath,
          );
          return null;
        }

        const supabaseUrl =
          process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, '') ?? '';
        const signedUrl = data.signedUrl.startsWith('/')
          ? `${supabaseUrl}/storage/v1${data.signedUrl}`
          : data.signedUrl;
        return signedUrl;
      } catch (err) {
        console.error('[photos.server] createSignedUrl threw:', err, 'path:', storagePath);
        return null;
      }
    },
    ['signed-url'],
    { revalidate: SIGNED_URL_CACHE_SECONDS },
  );
}

async function resolveServerPhotoUrlWithResolver(
  supabase: StorageUrlClient,
  resolveSignedRawUrl: SignedUrlResolver,
  photo: ServerPhotoUrlInput,
): Promise<string | null> {
  if (HTTPS_URL_PATTERN.test(photo.storage_path)) {
    return photo.storage_path;
  }

  const storagePathDate = photo.storage_path.split('/')[0];
  const bestStoragePath = `${storagePathDate}/best.jpg`;

  if (photo.is_best_of_day && photo.storage_path === bestStoragePath) {
    return supabase.storage.from(BEST_PHOTOS_BUCKET).getPublicUrl(photo.storage_path).data
      .publicUrl;
  }

  return resolveSignedRawUrl(photo.storage_path);
}

export async function resolveServerPhotoUrl(
  supabase: StorageUrlClient,
  photo: ServerPhotoUrlInput,
): Promise<string | null> {
  return resolveServerPhotoUrlWithResolver(
    supabase,
    createCachedSignedUrlResolver(supabase),
    photo,
  );
}

export async function resolveServerPhotoUrls(
  supabase: StorageUrlClient,
  photos: Photo[],
): Promise<PhotoWithResolvedUrl[]> {
  const resolveSignedRawUrl = createCachedSignedUrlResolver(supabase);

  return Promise.all(
    photos.map(async (photo) => ({
      ...photo,
      storage_path: await resolveServerPhotoUrlWithResolver(supabase, resolveSignedRawUrl, photo),
    })),
  );
}
