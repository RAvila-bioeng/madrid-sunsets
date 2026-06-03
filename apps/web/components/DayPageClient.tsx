'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';

import type { Photo } from '@sunset/shared';

import { resolvePhotoUrl } from '@/lib/photos';
import { cn, parseDateString } from '@/lib/utils';
import { PhotoImage } from './PhotoImage';

type DayPageClientProps = {
  photos: Photo[];
  initialPhotoId: string;
  isAdmin: boolean;
  date: string;
};

export function DayPageClient({ photos, initialPhotoId, isAdmin, date }: DayPageClientProps) {
  const [selectedId, setSelectedId] = useState(initialPhotoId);
  const [bestPhotoId, setBestPhotoId] = useState(
    () => photos.find((p) => p.is_best_of_day)?.id ?? initialPhotoId,
  );
  const [pendingPhotoId, setPendingPhotoId] = useState<string | null>(null);
  const t = useTranslations('day');
  const locale = useLocale();
  const format = useFormatter();
  const prefersReducedMotion = useReducedMotion();

  const selected = photos.find((p) => p.id === selectedId) ?? photos[0];
  if (!selected || photos.length === 0) return null;
  const selectedPhotoUrl = resolvePhotoUrl(selected.storage_path);

  async function handleMarkBest(photoId: string) {
    if (pendingPhotoId !== null) return;

    setPendingPhotoId(photoId);
    try {
      const res = await fetch(`/api/photos/${photoId}/mark-best`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      });
      if (res.ok) setBestPhotoId(photoId);
    } finally {
      setPendingPhotoId(null);
    }
  }

  function photoAlt(photo: Photo): string {
    return t('photoAlt', {
      date: format.dateTime(parseDateString(photo.day_date), {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Europe/Madrid',
      }),
      time: format.dateTime(new Date(photo.captured_at), {
        hour: locale === 'en' ? 'numeric' : '2-digit',
        minute: '2-digit',
        hour12: locale === 'en',
        timeZone: 'Europe/Madrid',
      }),
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="relative w-full overflow-hidden rounded-2xl border border-border/70 bg-surface p-2 shadow-[0_24px_80px_rgba(28,25,23,0.14)]">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br from-accent-gold/14 via-surface to-accent-rose/10">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              {selectedPhotoUrl ? (
                <PhotoImage
                  src={selectedPhotoUrl}
                  alt={photoAlt(selected)}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 60vw"
                  priority
                  className="object-contain"
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute right-4 top-4 rounded-full bg-black/35 px-2.5 py-1 backdrop-blur-sm">
          <span className="font-mono text-xs text-white/70 tabular-nums">
            {(selected.score * 100).toFixed(0)}
          </span>
        </div>
      </div>

      {photos.length > 1 && (
        <div
          aria-label={t('strip.ariaLabel')}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        >
          {photos.map((photo) => {
            const isSelected = photo.id === selectedId;
            const photoUrl = resolvePhotoUrl(photo.storage_path);
            return (
              <button
                key={photo.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedId(photo.id)}
                className={cn(
                  'relative flex-none w-24 aspect-square overflow-hidden rounded-md',
                  'border border-border/60 transition-all duration-200 focus-visible:outline-none',
                  'focus-visible:ring-2 focus-visible:ring-accent-warm focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  isSelected
                    ? 'opacity-100 ring-2 ring-accent-warm ring-offset-2 ring-offset-background'
                    : 'opacity-60 hover:opacity-100',
                )}
              >
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt={photoAlt(photo)}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : null}
                {isAdmin && (
                  <button
                    type="button"
                    aria-label={t('markBest')}
                    disabled={pendingPhotoId !== null}
                    className="absolute top-0.5 right-0.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-warm"
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleMarkBest(photo.id);
                    }}
                  >
                    <Star
                      size={14}
                      className={photo.id === bestPhotoId ? 'text-amber-400' : 'text-white/50'}
                      fill={photo.id === bestPhotoId ? 'currentColor' : 'none'}
                    />
                  </button>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
