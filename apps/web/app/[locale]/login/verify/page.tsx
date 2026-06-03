import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

import { OtpForm } from '@/components/OtpForm';
import { routing } from '@/i18n/routing';
import { normalizeEmail } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

type VerifyPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ email?: string; next?: string }>;
};

function localizedPath(locale: string, path: string): string {
  return locale === routing.defaultLocale ? path : `/${locale}${path}`;
}

function getSafeNext(next: string | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/';
  return next;
}

export default async function VerifyPage({ params, searchParams }: VerifyPageProps) {
  const { locale } = await params;
  const { email: rawEmail, next } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('auth.verify');

  const email = normalizeEmail(rawEmail ?? '');
  if (!email.includes('@')) {
    redirect(localizedPath(locale, '/login'));
  }

  const safeNext = getSafeNext(next);

  async function verifyCode(
    prevState: { error: string | null; errorCount: number },
    formData: FormData,
  ): Promise<{ error: string | null; errorCount: number }> {
    'use server';

    const formEmail = normalizeEmail(String(formData.get('email') ?? ''));
    const token = String(formData.get('token') ?? '').replace(/\s/g, '');
    const nextPath = getSafeNext(String(formData.get('next') ?? '/'));

    if (!/^\d{6,10}$/.test(token)) {
      return { error: 'invalid_code', errorCount: prevState.errorCount + 1 };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: formEmail,
      token,
      type: 'email',
    });

    if (error) {
      console.error('[auth] verifyOtp error:', error.message, error.status);
      return { error: 'invalid_code', errorCount: prevState.errorCount + 1 };
    }

    const separator = nextPath.includes('?') ? '&' : '?';
    redirect(`${nextPath}${separator}welcome=1`);
  }

  const loginHref = localizedPath(locale, `/login?email=${encodeURIComponent(email)}`);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col items-center justify-center px-6 py-16">
      <div className="w-full rounded-2xl border border-border bg-surface px-6 py-10 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground">
            {t('title')}
          </h1>
          <p className="mt-4 text-sm leading-6 text-foreground-muted">
            {t.rich('description', {
              email,
              b: (chunks) => <span className="font-medium text-foreground">{chunks}</span>,
            })}
          </p>
        </div>
        <OtpForm
          action={verifyCode}
          email={email}
          next={safeNext}
          labels={{
            codeLabel: t('codeLabel'),
            submit: t('submit'),
            pending: t('pending'),
            invalidCode: t('invalidCode'),
            noCode: t('noCode'),
            requestNew: t('requestNew'),
            loginHref,
          }}
        />
      </div>
    </div>
  );
}
