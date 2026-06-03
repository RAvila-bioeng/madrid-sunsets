import clsx from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-');
  const year = Number(y ?? '0');
  const month = Number(m ?? '1');
  const day = Number(d ?? '1');
  return new Date(year, month - 1, day, 12);
}
