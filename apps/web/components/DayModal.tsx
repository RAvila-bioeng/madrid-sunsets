'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { useCallback, useEffect } from 'react';

import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

type DayModalProps = {
  children: ReactNode;
};

export function DayModal({ children }: DayModalProps) {
  const router = useRouter();
  const t = useTranslations('day');
  const prefersReducedMotion = useReducedMotion();

  const close = useCallback(() => router.back(), [router]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close();
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [close]);

  return (
    <motion.dialog
      open
      aria-label={t('modal.ariaLabel')}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
      onClick={close}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
    >
      <motion.div
        className={cn(
          'relative max-h-[min(92vh,900px)] w-full max-w-3xl overflow-y-auto',
          'rounded-2xl bg-background p-4 shadow-2xl sm:p-6',
        )}
        initial={{ scale: prefersReducedMotion ? 1 : 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: prefersReducedMotion ? 1 : 0.97, opacity: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label={t('modal.close')}
          className={cn(
            'absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center',
            'rounded-full bg-black/40 text-white backdrop-blur-sm',
            'transition-colors hover:bg-black/60',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
          )}
        >
          <X size={16} aria-hidden="true" />
        </button>

        {children}
      </motion.div>
    </motion.dialog>
  );
}
