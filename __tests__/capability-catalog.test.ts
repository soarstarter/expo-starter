import en from '@/lib/i18n/en.json';
import zh from '@/lib/i18n/zh.json';
import {
  CAPABILITY_CATALOG,
  capabilitiesIn,
  capabilityForHref,
} from '@/lib/showcase/capability-catalog';
import { CAPABILITY_CATEGORIES } from '@/lib/showcase/capability-category';
import { statusLabelKey } from '@/lib/showcase/capability-status';
import { routeExists } from '@/test/helpers/routes';

function hasKey(messages: unknown, key: string) {
  const value = key
    .split('.')
    .reduce<unknown>(
      (node, part) => (node && typeof node === 'object' ? (node as never)[part] : undefined),
      messages
    );
  return typeof value === 'string' && value.length > 0;
}

describe('showcase capability catalog', () => {
  it('uses unique ids', () => {
    const ids = CAPABILITY_CATALOG.map((capability) => capability.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has an English and a Chinese title and summary for every row', () => {
    const missing = CAPABILITY_CATALOG.flatMap((capability) =>
      [capability.titleKey, capability.summaryKey, statusLabelKey(capability.status)].flatMap(
        (key) => [
          ...(hasKey(en, key) ? [] : [`en:${key}`]),
          ...(hasKey(zh, key) ? [] : [`zh:${key}`]),
        ]
      )
    );
    expect(missing).toEqual([]);
  });

  it('points every demo link at an existing screen', () => {
    const broken = CAPABILITY_CATALOG.filter(
      (capability) => capability.href != null && !routeExists(String(capability.href))
    ).map((capability) => `${capability.id} -> ${String(capability.href)}`);
    expect(broken).toEqual([]);
  });

  it('places every row in a listed category and leaves no category empty', () => {
    const categories = CAPABILITY_CATEGORIES.map((meta) => meta.category);
    for (const capability of CAPABILITY_CATALOG) {
      expect(categories).toContain(capability.category);
    }
    for (const meta of CAPABILITY_CATEGORIES) {
      expect(capabilitiesIn(meta.category).length).toBeGreaterThan(0);
      expect(hasKey(en, meta.titleKey) && hasKey(zh, meta.titleKey)).toBe(true);
    }
  });

  it('groups rows by category in catalog order', () => {
    const regrouped = CAPABILITY_CATEGORIES.flatMap((meta) => capabilitiesIn(meta.category));
    expect(regrouped).toHaveLength(CAPABILITY_CATALOG.length);
    for (const meta of CAPABILITY_CATEGORIES) {
      const inCatalogOrder = CAPABILITY_CATALOG.filter((c) => c.category === meta.category);
      expect(capabilitiesIn(meta.category)).toEqual(inCatalogOrder);
    }
  });

  it('finds a row by its demo link', () => {
    const linked = CAPABILITY_CATALOG.filter((capability) => capability.href != null);
    expect(linked.length).toBeGreaterThan(0);
    for (const capability of linked) {
      expect(capabilityForHref(capability.href)?.id).toBe(capability.id);
    }
    expect(capabilityForHref(null)).toBeUndefined();
  });
});
