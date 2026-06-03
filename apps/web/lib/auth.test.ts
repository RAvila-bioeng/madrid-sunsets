import type { User } from '@supabase/supabase-js';
import { afterEach, describe, expect, it, vi } from 'vitest';

// auth.ts imports Next.js and project modules that need the Next.js runtime — mock them out
// so we can test the pure synchronous helpers in isolation
vi.mock('@/i18n/routing', () => ({ routing: { defaultLocale: 'es', locales: ['es', 'en'] } }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('./supabase/server', () => ({ createClient: vi.fn() }));

import { isAdmin, isAllowedUser } from './auth';

afterEach(() => vi.unstubAllEnvs());

describe('isAllowedUser', () => {
  it('returns false for null', () => {
    expect(isAllowedUser(null)).toBe(false);
  });

  it('returns false for a user without an email', () => {
    // Minimal object — isAllowedUser only accesses .email
    const user = { email: undefined } as unknown as User;
    expect(isAllowedUser(user)).toBe(false);
  });

  it('returns false when email is not in the allowlist', () => {
    vi.stubEnv('ADMIN_EMAIL', 'admin@example.com');
    vi.stubEnv('RECIPIENT_EMAILS', 'partner@example.com');
    const user = { email: 'stranger@example.com' } as unknown as User;
    expect(isAllowedUser(user)).toBe(false);
  });

  it('returns true when email matches ADMIN_EMAIL', () => {
    vi.stubEnv('ADMIN_EMAIL', 'admin@example.com');
    vi.stubEnv('RECIPIENT_EMAILS', 'partner@example.com');
    const user = { email: 'admin@example.com' } as unknown as User;
    expect(isAllowedUser(user)).toBe(true);
  });

  it('returns true when email matches RECIPIENT_EMAILS', () => {
    vi.stubEnv('ADMIN_EMAIL', 'admin@example.com');
    vi.stubEnv('RECIPIENT_EMAILS', 'partner@example.com');
    const user = { email: 'partner@example.com' } as unknown as User;
    expect(isAllowedUser(user)).toBe(true);
  });

  it('returns true for any email in a comma-separated RECIPIENT_EMAILS list', () => {
    vi.stubEnv('ADMIN_EMAIL', 'admin@example.com');
    vi.stubEnv('RECIPIENT_EMAILS', 'partner@example.com, friend@example.com , other@example.com');
    for (const email of ['partner@example.com', 'friend@example.com', 'other@example.com']) {
      expect(isAllowedUser({ email } as unknown as User)).toBe(true);
    }
  });

  it('returns false when neither env var is set', () => {
    vi.stubEnv('ADMIN_EMAIL', '');
    vi.stubEnv('RECIPIENT_EMAILS', '');
    const user = { email: 'someone@example.com' } as unknown as User;
    expect(isAllowedUser(user)).toBe(false);
  });
});

describe('isAdmin', () => {
  it('returns true when email matches ADMIN_EMAIL', () => {
    vi.stubEnv('ADMIN_EMAIL', 'admin@example.com');
    expect(isAdmin('admin@example.com')).toBe(true);
  });

  it('returns false when email matches RECIPIENT_EMAILS but not ADMIN_EMAIL', () => {
    vi.stubEnv('ADMIN_EMAIL', 'admin@example.com');
    vi.stubEnv('RECIPIENT_EMAILS', 'partner@example.com');
    expect(isAdmin('partner@example.com')).toBe(false);
  });

  it('returns false when ADMIN_EMAIL env var is absent', () => {
    vi.stubEnv('ADMIN_EMAIL', '');
    expect(isAdmin('admin@example.com')).toBe(false);
  });
});
