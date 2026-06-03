import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

import { LoginSubmitButton } from '@/components/LoginSubmitButton';
import { routing } from '@/i18n/routing';
import { normalizeEmail } from '@/lib/auth';
import { getAuthCallbackUrl } from '@/lib/auth-callback';
import { createClient } from '@/lib/supabase/server';

type LoginPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    email?: string;
    next?: string;
    error?: 'link_expired' | 'send_failed';
  }>;
};

function localizedPath(locale: string, path: string): string {
  return locale === routing.defaultLocale ? path : `/${locale}${path}`;
}

function getSafeNext(next: string | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/';
  return next;
}

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { locale } = await params;
  const { email: prefillEmail, next, error } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('auth.login');
  const safeNext = getSafeNext(next);

  async function requestOtp(formData: FormData) {
    'use server';

    const requestLocale = await getLocale();
    const email = normalizeEmail(String(formData.get('email') ?? ''));
    const nextPath = getSafeNext(String(formData.get('next') ?? '/'));
    const verifyPath = localizedPath(requestLocale, '/login/verify');
    const verifyUrl = `${verifyPath}?email=${encodeURIComponent(email)}&next=${encodeURIComponent(nextPath)}`;

    if (!email || !email.includes('@')) {
      redirect(
        localizedPath(
          requestLocale,
          `/login?error=send_failed&next=${encodeURIComponent(nextPath)}`,
        ),
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getAuthCallbackUrl(requestLocale, nextPath),
      },
    });

    if (error) {
      console.error('[auth] signInWithOtp error:', error.message, error.status);
      redirect(
        localizedPath(
          requestLocale,
          `/login?error=send_failed&next=${encodeURIComponent(nextPath)}`,
        ),
      );
    }

    redirect(verifyUrl);
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col items-center justify-center px-6 py-16">
      <form
        action={requestOtp}
        className="w-full rounded-2xl border border-border bg-surface px-6 py-10 shadow-sm"
      >
        <div className="text-center">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground">
            {t('title')}
          </h1>
          <p className="mt-4 text-sm leading-6 text-foreground-muted">{t('description')}</p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            {t('emailLabel')}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            defaultValue={prefillEmail ? decodeURIComponent(prefillEmail) : ''}
            placeholder={t('emailPlaceholder')}
            className="h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-foreground-muted/60 focus:border-accent-warm focus:ring-2 focus:ring-accent-warm/25"
          />
          <input type="hidden" name="next" value={safeNext} />
          {error === 'link_expired' ? (
            <p className="min-h-5 text-xs text-red-500">{t('linkExpired')}</p>
          ) : error === 'send_failed' ? (
            <p className="min-h-5 text-xs text-red-500">{t('sendFailed')}</p>
          ) : (
            <p className="min-h-5 text-xs text-foreground-muted">{t('softMessage')}</p>
          )}
        </div>

        <div className="mt-6">
          <LoginSubmitButton pendingLabel={t('pending')} submitLabel={t('submit')} />
        </div>
      </form>
    </div>
  );
}
