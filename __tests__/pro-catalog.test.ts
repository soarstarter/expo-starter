import en from '@/lib/i18n/en.json';
import zh from '@/lib/i18n/zh.json';
import { CAPABILITY_CATALOG } from '@/lib/showcase/capability-catalog';
import { PRO_CATALOG, PRO_UPGRADE_URL } from '@/lib/showcase/pro-catalog';

function messageAt(messages: unknown, key: string): unknown {
  return key
    .split('.')
    .reduce<unknown>(
      (node, part) => (node && typeof node === 'object' ? (node as never)[part] : undefined),
      messages
    );
}

describe('PRO_CATALOG', () => {
  it('has unique ids that never collide with the live capabilities', () => {
    const ids = PRO_CATALOG.map((capability) => capability.id);
    expect(new Set(ids).size).toBe(ids.length);

    const liveIds = new Set(CAPABILITY_CATALOG.map((capability) => capability.id));
    expect(ids.filter((id) => liveIds.has(id))).toEqual([]);
  });

  it.each([
    ['en', en],
    ['zh', zh],
  ])('has a title and summary for every entry in %s', (_, messages) => {
    for (const capability of PRO_CATALOG) {
      expect(messageAt(messages, capability.titleKey)).toEqual(expect.any(String));
      expect(messageAt(messages, capability.summaryKey)).toEqual(expect.any(String));
    }
    for (const key of ['pro.title', 'pro.description', 'pro.badge', 'pro.action']) {
      expect(messageAt(messages, key)).toEqual(expect.any(String));
    }
  });

  it('has no locale entries without a catalog row', () => {
    const ids = PRO_CATALOG.map((capability) => capability.id).sort();
    expect(Object.keys(en.pro.items).sort()).toEqual(ids);
    expect(Object.keys(zh.pro.items).sort()).toEqual(ids);
  });

  it('links to the Pro page with the GitHub campaign parameters', () => {
    const url = new URL(PRO_UPGRADE_URL);
    expect(url.protocol).toBe('https:');
    expect(url.host).toBe('soarstarter.com');
    expect(url.pathname).toBe('/expo');
    expect(url.searchParams.get('utm_source')).toBe('github');
    expect(url.searchParams.get('utm_campaign')).toBe('expo-lite');
  });
});
