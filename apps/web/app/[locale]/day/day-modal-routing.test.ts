import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const appRoot = join(process.cwd(), 'app', '[locale]');

describe('day detail routing', () => {
  it('navigates directly to the standalone day page (no modal intercept)', () => {
    const standalonePage = join(appRoot, 'day', '[date]', 'page.tsx');
    const modalPage = join(appRoot, '@modal', '(.)day', '[date]', 'page.tsx');
    const modalDefault = join(appRoot, '@modal', 'default.tsx');

    expect(existsSync(standalonePage)).toBe(true);
    // The intercepting modal route was removed — clicking a day cell navigates to the full page
    expect(existsSync(modalPage)).toBe(false);
    expect(readFileSync(modalDefault, 'utf8')).toContain('return null');
    expect(readFileSync(standalonePage, 'utf8')).toContain('<DayDetail date={date} />');
  });

  it('uses localized navigation from day cells so clicking a photo updates the URL', () => {
    const dayCell = readFileSync(join(process.cwd(), 'components', 'DayCell.tsx'), 'utf8');

    expect(dayCell).toContain("import { Link } from '@/i18n/navigation'");
    expect(dayCell).toContain('href={`/day/${date}`}');
    expect(dayCell).not.toContain('preventDefault');
  });
});
