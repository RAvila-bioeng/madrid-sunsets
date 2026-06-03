import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('auth routing', () => {
  it('protects private photo routes and sends visitors to login', () => {
    const proxy = readFileSync(join(process.cwd(), 'proxy.ts'), 'utf8');

    expect(proxy).toContain('/^\\/day\\/[^/]+$/');
    expect(proxy).toContain('/^\\/live\\/?$/');
    expect(proxy).toContain('/^\\/\\d{4}\\/\\d{2}\\/?$/');
    expect(proxy).toContain("url.searchParams.set('next', next)");
  });

  it('restricts access to ADMIN_EMAIL and RECIPIENT_EMAILS at the app layer', () => {
    const loginPage = readFileSync(
      join(process.cwd(), 'app', '[locale]', 'login', 'page.tsx'),
      'utf8',
    );
    const auth = readFileSync(join(process.cwd(), 'lib', 'auth.ts'), 'utf8');

    expect(auth).toContain('process.env.ADMIN_EMAIL');
    expect(auth).toContain('process.env.RECIPIENT_EMAILS');
    expect(loginPage).not.toContain('isAllowedRecipient');
    expect(loginPage).toContain('signInWithOtp');
    expect(loginPage).toContain('emailRedirectTo: getAuthCallbackUrl(requestLocale, nextPath)');
    expect(loginPage).toContain('/login/verify');
  });

  it('uses one deterministic auth callback instead of exchanging codes on the homepage', () => {
    const homePage = readFileSync(join(process.cwd(), 'app', '[locale]', 'page.tsx'), 'utf8');
    const callbackRoute = readFileSync(
      join(process.cwd(), 'app', '[locale]', 'auth', 'callback', 'route.ts'),
      'utf8',
    );
    const callbackHelpers = readFileSync(join(process.cwd(), 'lib', 'auth-callback.ts'), 'utf8');

    expect(homePage).not.toContain('exchangeCodeAndRedirect');
    expect(callbackRoute).toContain('exchangeCodeForSession(code)');
    expect(callbackHelpers).toContain('export function getAuthCallbackUrl');
    expect(callbackHelpers).toContain('process.env.SITE_URL');
    expect(callbackHelpers).toContain('process.env.VERCEL_URL');
    expect(callbackHelpers).toContain("'/auth/callback'");
  });

  it('keeps the Supabase email template aligned with link and flexible OTP login', () => {
    const template = readFileSync(
      join(process.cwd(), '..', '..', 'supabase', 'templates', 'magic-link.html'),
      'utf8',
    );
    const verifyPage = readFileSync(
      join(process.cwd(), 'app', '[locale]', 'login', 'verify', 'page.tsx'),
      'utf8',
    );
    const otpForm = readFileSync(join(process.cwd(), 'components', 'OtpForm.tsx'), 'utf8');

    expect(template).toContain('{{ .ConfirmationURL }}');
    expect(template).toContain('{{ .Token }}');
    expect(template).not.toContain('{{ .TokenHash }}');
    expect(verifyPage).toContain("type: 'email'");
    expect(verifyPage).toContain('/^\\d{6,10}$/.test(token)');
    expect(otpForm).toContain('maxLength={10}');
    expect(otpForm).toContain('pattern="[0-9]{6,10}"');
    expect(otpForm).not.toContain('requestSubmit');
  });

  it('keeps the expected photo RLS split for anon and authenticated users', () => {
    const migration = readFileSync(
      join(
        process.cwd(),
        '..',
        '..',
        'supabase',
        'migrations',
        '20260425223811_initial_schema.sql',
      ),
      'utf8',
    );

    expect(migration).toContain('to anon');
    expect(migration).toContain('using (is_best_of_day = true)');
    expect(migration).toContain('photos are readable by authenticated users');
    expect(migration).toContain('to authenticated');
    expect(migration).toContain('using (true)');
  });
});
