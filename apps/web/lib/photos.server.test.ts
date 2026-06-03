import type { Photo } from '@sunset/shared';
import { unstable_cache } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type StorageUrlClient, resolveServerPhotoUrls } from './photos.server';

const { signedUrlCache, unstableCacheMock } = vi.hoisted(() => {
  const signedUrlCache = new Map<string, unknown>();
  const unstableCacheMock = vi.fn(
    <Args extends unknown[], Return>(
      callback: (...args: Args) => Promise<Return>,
      keyParts: string[],
      _options: { revalidate: number },
    ) =>
      async (...args: Args): Promise<Return> => {
        const key = JSON.stringify([keyParts, args]);
        if (!signedUrlCache.has(key)) {
          signedUrlCache.set(key, callback(...args));
        }
        return (await signedUrlCache.get(key)) as Return;
      },
  );

  return { signedUrlCache, unstableCacheMock };
});

vi.mock('next/cache', () => ({
  unstable_cache: unstableCacheMock,
}));

function photo(overrides: Pick<Photo, 'is_best_of_day' | 'storage_path'>): Photo {
  return {
    captured_at: '2026-05-13T19:30:00.000Z',
    created_at: '2026-05-13T19:30:00.000Z',
    day_date: '2026-05-13',
    exif: null,
    height: 1080,
    id: 'photo-id',
    score: 0.92,
    score_components: {},
    width: 1440,
    ...overrides,
  };
}

function storageClient() {
  const getPublicUrl = vi.fn((storagePath: string) => ({
    data: {
      publicUrl: `https://example.supabase.co/storage/v1/object/public/sunsets-best/${storagePath}`,
    },
  }));
  const createSignedUrl = vi.fn((storagePath: string, expiresIn: number) =>
    Promise.resolve<{ data: { signedUrl: string } | null; error: Error | null }>({
      data: {
        signedUrl: `https://example.supabase.co/storage/v1/object/sign/sunsets-raw/${storagePath}?ttl=${expiresIn}`,
      },
      error: null,
    }),
  );
  const from = vi.fn((bucket: string) => ({
    getPublicUrl,
    createSignedUrl,
    bucket,
  }));
  const supabase: StorageUrlClient = {
    storage: {
      from,
    },
  };

  return { supabase, from, getPublicUrl, createSignedUrl };
}

describe('resolveServerPhotoUrls', () => {
  beforeEach(() => {
    signedUrlCache.clear();
    vi.clearAllMocks();
  });

  it('leaves https seed URLs unchanged', async () => {
    const { supabase, from } = storageClient();
    const url = 'https://images.example/photo.jpg';

    await expect(
      resolveServerPhotoUrls(supabase, [photo({ is_best_of_day: false, storage_path: url })]),
    ).resolves.toMatchObject([{ storage_path: url }]);
    expect(from).not.toHaveBeenCalled();
  });

  it('uses the public best bucket for best-of-day photos', async () => {
    const { supabase, from, getPublicUrl, createSignedUrl } = storageClient();

    await expect(
      resolveServerPhotoUrls(supabase, [
        photo({ is_best_of_day: true, storage_path: '2026-05-13/best.jpg' }),
      ]),
    ).resolves.toMatchObject([
      {
        storage_path:
          'https://example.supabase.co/storage/v1/object/public/sunsets-best/2026-05-13/best.jpg',
      },
    ]);
    expect(from).toHaveBeenCalledWith('sunsets-best');
    expect(getPublicUrl).toHaveBeenCalledWith('2026-05-13/best.jpg');
    expect(createSignedUrl).not.toHaveBeenCalled();
  });

  it('creates signed raw URLs for best-of-day photos that still point at raw paths', async () => {
    const { supabase, from, getPublicUrl, createSignedUrl } = storageClient();

    await expect(
      resolveServerPhotoUrls(supabase, [
        photo({ is_best_of_day: true, storage_path: '2026-05-13/20260513-193000.jpg' }),
      ]),
    ).resolves.toMatchObject([
      {
        storage_path:
          'https://example.supabase.co/storage/v1/object/sign/sunsets-raw/2026-05-13/20260513-193000.jpg?ttl=3600',
      },
    ]);
    expect(from).toHaveBeenCalledWith('sunsets-raw');
    expect(createSignedUrl).toHaveBeenCalledWith('2026-05-13/20260513-193000.jpg', 3600);
    expect(getPublicUrl).not.toHaveBeenCalled();
  });

  it('creates one-hour signed URLs for raw photos', async () => {
    const { supabase, from, createSignedUrl } = storageClient();

    await expect(
      resolveServerPhotoUrls(supabase, [
        photo({ is_best_of_day: false, storage_path: '2026-05-13/raw.jpg' }),
      ]),
    ).resolves.toMatchObject([
      {
        storage_path:
          'https://example.supabase.co/storage/v1/object/sign/sunsets-raw/2026-05-13/raw.jpg?ttl=3600',
      },
    ]);
    expect(from).toHaveBeenCalledWith('sunsets-raw');
    expect(createSignedUrl).toHaveBeenCalledWith('2026-05-13/raw.jpg', 3600);
  });

  it('caches signed raw URL creation for 50 minutes', async () => {
    const { supabase, createSignedUrl } = storageClient();

    await expect(
      resolveServerPhotoUrls(supabase, [
        photo({ is_best_of_day: false, storage_path: '2026-05-13/raw.jpg' }),
        photo({ is_best_of_day: false, storage_path: '2026-05-13/raw.jpg' }),
      ]),
    ).resolves.toMatchObject([
      {
        storage_path:
          'https://example.supabase.co/storage/v1/object/sign/sunsets-raw/2026-05-13/raw.jpg?ttl=3600',
      },
      {
        storage_path:
          'https://example.supabase.co/storage/v1/object/sign/sunsets-raw/2026-05-13/raw.jpg?ttl=3600',
      },
    ]);
    expect(unstable_cache).toHaveBeenCalledWith(expect.any(Function), ['signed-url'], {
      revalidate: 50 * 60,
    });
    expect(createSignedUrl).toHaveBeenCalledTimes(1);
  });

  it('returns null for raw photos when storage returns an error', async () => {
    const { supabase, createSignedUrl } = storageClient();
    createSignedUrl.mockResolvedValueOnce({
      data: null,
      error: new Error('Object not found'),
    });

    await expect(
      resolveServerPhotoUrls(supabase, [
        photo({ is_best_of_day: false, storage_path: '2026-05-13/missing.jpg' }),
      ]),
    ).resolves.toMatchObject([{ storage_path: null }]);
  });

  it('returns null for raw photos when signed URL creation throws', async () => {
    const { supabase, createSignedUrl } = storageClient();
    createSignedUrl.mockRejectedValueOnce(new Error('Object not found'));

    await expect(
      resolveServerPhotoUrls(supabase, [
        photo({ is_best_of_day: false, storage_path: '2026-05-13/orphaned.jpg' }),
      ]),
    ).resolves.toMatchObject([{ storage_path: null }]);
  });
});
