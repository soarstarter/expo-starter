import { createAppLink, resolveDeepLinkHref } from '@/lib/deep-links';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('expo-constants', () => {
  const ExecutionEnvironment = {
    Bare: 'bare',
    Standalone: 'standalone',
    StoreClient: 'storeClient',
  };
  return {
    __esModule: true,
    ExecutionEnvironment,
    default: {
      executionEnvironment: ExecutionEnvironment.Bare,
      expoConfig: { scheme: 'expo-starter' },
    },
  };
});

describe('resolveDeepLinkHref', () => {
  it('decodes query values once (SDK 58 Linking.parse)', () => {
    // `%2540` is an encoded `%40`; decoding it twice would turn it into `@`.
    expect(resolveDeepLinkHref('expo-starter:///showcase?ref=a%2540b%2Bc')).toBe(
      '/showcase?ref=a%2540b%2Bc'
    );
  });

  it('resolves an allowed path from the route parameter', () => {
    expect(resolveDeepLinkHref('expo-starter:///?route=%2Fpaywall')).toBe(
      '/paywall?route=%2Fpaywall'
    );
  });

  it('rejects paths outside the allow list', () => {
    expect(resolveDeepLinkHref('expo-starter:///admin')).toBeNull();
  });

  it.each([
    ['expo-starter://paywall', '/paywall'],
    ['expo-starter:///paywall', '/paywall'],
    ['expo-starter://showcase?ref=x', '/showcase?ref=x'],
    ['expo-starter-dev://permissions/', '/permissions'],
    ['demo://permissions', '/permissions'],
    ['demo:///permissions', '/permissions'],
    ['expo-starter://', '/'],
  ])('resolves custom-scheme link %s to %s', (url, href) => {
    expect(resolveDeepLinkHref(url)).toBe(href);
  });

  it('rejects host-form custom-scheme paths outside the allow list', () => {
    expect(resolveDeepLinkHref('expo-starter://admin')).toBeNull();
    expect(resolveDeepLinkHref('expo-starter://paywall/extra')).toBeNull();
  });

  it('ignores the host of https and Expo Go links', () => {
    expect(resolveDeepLinkHref('https://example.com/paywall')).toBe('/paywall');
    expect(resolveDeepLinkHref('https://paywall.example.com/')).toBe('/');
    expect(resolveDeepLinkHref('exp://192.168.1.5:8081/--/showcase')).toBe('/showcase');
  });

  describe('createAppLink round trip', () => {
    const originalDomain = process.env.EXPO_PUBLIC_LINKING_DOMAIN;
    afterEach(() => {
      if (originalDomain === undefined) delete process.env.EXPO_PUBLIC_LINKING_DOMAIN;
      else process.env.EXPO_PUBLIC_LINKING_DOMAIN = originalDomain;
    });

    it.each(['/paywall', '/showcase', '/'])('resolves the custom-scheme link for %s', (path) => {
      delete process.env.EXPO_PUBLIC_LINKING_DOMAIN;
      expect(resolveDeepLinkHref(createAppLink(path))).toBe(path);
    });

    it('resolves the universal link for a path', () => {
      process.env.EXPO_PUBLIC_LINKING_DOMAIN = 'links.example.com';
      expect(createAppLink('/paywall')).toBe('https://links.example.com/paywall');
      expect(resolveDeepLinkHref(createAppLink('/paywall'))).toBe('/paywall');
    });
  });
});
