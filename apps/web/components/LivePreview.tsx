'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useCallback, useEffect } from 'react';

import { useRouter } from '@/i18n/navigation';
import type { LatestPhoto } from '@/lib/queries';
import { cn, parseDateString } from '@/lib/utils';

type LivePreviewProps = {
  photo: LatestPhoto | null;
  asModal?: boolean;
};

export function LivePreview({ photo, asModal = false }: LivePreviewProps) {
  const router = useRouter();
  const t = useTranslations('live');
  const dayT = useTranslations('day');
  const locale = useLocale();
  const format = useFormatter();
  const prefersReducedMotion = useReducedMotion();

  const close = useCallback(() => router.back(), [router]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    if (asModal) {
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }
  }, [asModal, close]);

  const wrapperClass = asModal
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4'
    : 'relative flex min-h-screen items-center justify-center bg-background p-4';

  const alt = photo
    ? dayT('photoAlt', {
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
      })
    : '';
  const photoUrl = photo?.resolved_url ?? null;

  return (
    <motion.div
      className={wrapperClass}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
      onClick={asModal ? close : undefined}
    >
      <motion.div
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-surface shadow-2xl"
        initial={{ scale: prefersReducedMotion ? 1 : 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: prefersReducedMotion ? 1 : 0.97, opacity: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label={t('close')}
          className={cn(
            'absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center',
            'rounded-full bg-black/40 backdrop-blur-sm text-white',
            'transition-colors hover:bg-black/60',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
          )}
        >
          <X size={16} aria-hidden="true" />
        </button>

        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" aria-hidden="true" />
          <span className="font-mono text-[10px] text-white/90 tracking-wide uppercase">
            {t('badge')}
          </span>
        </div>

        <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-accent-warm/20 to-accent-rose/10">
          {photo && photoUrl ? (
            <Image
              src={photoUrl}
              alt={alt}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="font-display text-foreground-muted text-lg">{t('waiting')}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4">
          <p className="text-sm text-foreground-muted">{t('description')}</p>
          <button
            type="button"
            aria-label={t('request')}
            className={cn(
              'rounded-lg bg-accent-warm px-4 py-2 text-sm font-medium text-white',
              'transition-opacity hover:opacity-85',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-warm focus-visible:ring-offset-2',
            )}
          >
            {t('requestLabel')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
