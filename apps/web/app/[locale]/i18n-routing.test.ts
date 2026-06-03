import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('locale routing', () => {
  it('renders Spanish at / and English at /en with an as-needed prefix strategy', () => {
    const routing = readFileSync(join(process.cwd(), 'i18n', 'routing.ts'), 'utf8');
    const spanishMessages = readFileSync(join(process.cwd(), 'messages', 'es.json'), 'utf8');
    const englishMessages = readFileSync(join(process.cwd(), 'messages', 'en.json'), 'utf8');

    expect(routing).toContain("defaultLocale: 'es'");
    expect(routing).toContain("localePrefix: 'as-needed'");
    expect(spanishMessages).toContain('"title": "Cielo de Madrid"');
    expect(englishMessages).toContain('"title": "Madrid Sky"');
  });

  it('switches locale through next-intl navigation while preserving the current pathname', () => {
    const switcher = readFileSync(join(process.cwd(), 'components', 'LocaleSwitcher.tsx'), 'utf8');

    expect(switcher).toContain('usePathname()');
    expect(switcher).toContain('NEXT_LOCALE=');
    expect(switcher).toContain('router.replace(pathname, { locale: nextLocale })');
  });
});
