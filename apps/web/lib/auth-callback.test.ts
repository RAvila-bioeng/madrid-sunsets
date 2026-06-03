import { afterEach, describe, expect, it, vi } from 'vitest';

import { getAuthCallbackUrl, getSafeNextPath } from './auth-callback';

describe('auth callback helpers', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('builds callback URLs that match the as-needed locale routing', () => {
    vi.stubEnv('SITE_URL', 'https://cielo.example');

    expect(getAuthCallbackUrl('es', '/day/2026-04-20')).toBe(
      'https://cielo.example/auth/callback?next=%2Fday%2F2026-04-20',
    );
    expect(getAuthCallbackUrl('en', '/en/day/2026-04-20')).toBe(
      'https://cielo.example/en/auth/callback?next=%2Fen%2Fday%2F2026-04-20',
    );
  });

  it('keeps next paths relative and rejects open redirects', () => {
    expect(getSafeNextPath('/day/2026-04-20')).toBe('/day/2026-04-20');
    expect(getSafeNextPath('/en/2026/04?welcome=1')).toBe('/en/2026/04?welcome=1');
    expect(getSafeNextPath('https://evil.example')).toBe('/');
    expect(getSafeNextPath('//evil.example')).toBe('/');
    expect(getSafeNextPath(null)).toBe('/');
  });
});
