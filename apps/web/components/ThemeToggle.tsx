'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { useTheme } from './ThemeProvider';

const OPTIONS = [
  { value: 'light', icon: Sun, labelKey: 'light' },
  { value: 'system', icon: Monitor, labelKey: 'system' },
  { value: 'dark', icon: Moon, labelKey: 'dark' },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations('theme');

  return (
    <div
      aria-label={t('toggleLabel')}
      className="flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5"
    >
      {OPTIONS.map(({ value, icon: Icon, labelKey }) => (
        <button
          key={value}
          type="button"
          aria-label={t(labelKey)}
          aria-pressed={theme === value}
          onClick={() => setTheme(value)}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-warm',
            theme === value
              ? 'bg-accent-warm/10 text-accent-warm'
              : 'text-foreground-muted hover:text-foreground',
          )}
        >
          <Icon size={14} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
