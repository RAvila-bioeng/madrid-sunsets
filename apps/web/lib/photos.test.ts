import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resolvePhotoUrl } from './photos';

const mocks = vi.hoisted(() => ({
  getPublicUrl: vi.fn((storagePath: string) => ({
    data: {
      publicUrl: `https://example.supabase.co/storage/v1/object/public/sunsets-best/${storagePath}`,
    },
  })),
}));

vi.mock('./supabase/client', () => ({
  createClient: () => ({
    storage: {
      from: (bucket: string) => {
        expect(bucket).toBe('sunsets-best');
        return { getPublicUrl: mocks.getPublicUrl };
      },
    },
  }),
}));

describe('resolvePhotoUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns absolute placeholder URLs unchanged', () => {
    const url = 'https://images.unsplash.com/photo-123';

    expect(resolvePhotoUrl(url)).toBe(url);
    expect(mocks.getPublicUrl).not.toHaveBeenCalled();
  });

  it('resolves relative storage paths through the sunsets-best bucket', () => {
    expect(resolvePhotoUrl('2026-05-15/best.jpg')).toBe(
      'https://example.supabase.co/storage/v1/object/public/sunsets-best/2026-05-15/best.jpg',
    );
    expect(mocks.getPublicUrl).toHaveBeenCalledWith('2026-05-15/best.jpg');
  });

  it('returns null for raw relative storage paths', () => {
    expect(resolvePhotoUrl('2026-05-15/20260515-203000.jpg')).toBeNull();
  });
});
