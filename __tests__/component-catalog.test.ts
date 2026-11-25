import fs from 'node:fs';
import path from 'node:path';

import {
  COMPONENT_CATALOG,
  COMPONENT_GROUPS,
  componentForSlug,
  componentsIn,
} from '@/lib/component/component-catalog';
import { routeExists } from '@/test/helpers/routes';

const DETAIL_SCREEN = fs.readFileSync(
  path.join(__dirname, '..', 'app', 'component', '[slug].tsx'),
  'utf8'
);

describe('component gallery catalog', () => {
  it('uses unique, URL-safe slugs', () => {
    const slugs = COMPONENT_CATALOG.map((entry) => entry.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('opens every entry through the detail route', () => {
    for (const entry of COMPONENT_CATALOG) {
      expect(routeExists(`/component/${entry.slug}`)).toBe(true);
    }
  });

  it('has a demo case in the detail screen for every entry', () => {
    const missing = COMPONENT_CATALOG.filter(
      (entry) => !DETAIL_SCREEN.includes(`case '${entry.slug}':`)
    ).map((entry) => entry.slug);
    expect(missing).toEqual([]);
  });

  it('places every entry in a listed group and leaves no group empty', () => {
    const groups = COMPONENT_GROUPS.map((meta) => meta.group);
    for (const entry of COMPONENT_CATALOG) {
      expect(groups).toContain(entry.group);
      expect(entry.title.trim()).not.toBe('');
      expect(entry.summary.trim()).not.toBe('');
    }
    for (const meta of COMPONENT_GROUPS) {
      expect(componentsIn(meta.group).length).toBeGreaterThan(0);
    }
  });

  it('looks entries up by slug', () => {
    for (const entry of COMPONENT_CATALOG) {
      expect(componentForSlug(entry.slug)).toBe(entry);
    }
    expect(componentForSlug('does-not-exist')).toBeUndefined();
  });
});
