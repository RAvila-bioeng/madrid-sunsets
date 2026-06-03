'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';

type WelcomeToastProps = {
  message: string;
};

export function WelcomeToast({ message }: WelcomeToastProps) {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('welcome') !== '1') return;

    setVisible(true);
    const cleanParams = new URLSearchParams(searchParams);
    cleanParams.delete('welcome');
    const next = cleanParams.toString() ? `${pathname}?${cleanParams.toString()}` : pathname;
    router.replace(next, { scroll: false });

    const timeout = window.setTimeout(() => setVisible(false), 4200);
    return () => window.clearTimeout(timeout);
  }, [pathname, router, searchParams]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground shadow-lg">
      {message}
    </div>
  );
}
