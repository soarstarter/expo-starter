import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Localization from 'expo-localization';
import * as React from 'react';

import { I18nProvider, useI18n } from '@/lib/i18n';
import { createMemoryCache } from '@/test/helpers/memory-cache';

const mockCache = createMemoryCache();

jest.mock('@/lib/cache', () => ({
  getCacheJson: (key: string) => mockCache.getCacheJson(key),
  setCacheJson: (key: string, value: unknown) => mockCache.setCacheJson(key, value),
}));
jest.mock('expo-localization', () => ({ getLocales: jest.fn() }));

const LOCALE_KEY = 'preferences.locale.v1';
const getLocales = jest.mocked(Localization.getLocales);

function deviceLanguage(languageTag: string | null) {
  getLocales.mockReturnValue(
    (languageTag ? [{ languageTag }] : []) as unknown as ReturnType<typeof Localization.getLocales>
  );
}

type I18nValue = ReturnType<typeof useI18n>;

// The provider renders nothing until the saved language has been read, so the hook result
// comes through a probe context that stays `null` until then.
const ProbeContext = React.createContext<I18nValue | null>(null);

function Probe({ children }: { children: React.ReactNode }) {
  return <ProbeContext.Provider value={useI18n()}>{children}</ProbeContext.Provider>;
}

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <Probe>{children}</Probe>
    </I18nProvider>
  );
}

async function renderLocale() {
  const hook = await renderHook(() => React.useContext(ProbeContext), { wrapper });
  await waitFor(() => expect(hook.result.current).not.toBeNull());
  return hook.result as { current: I18nValue };
}

beforeEach(() => {
  mockCache.store.clear();
  deviceLanguage('en-US');
});

describe('language', () => {
  it('follows the device language on first launch', async () => {
    deviceLanguage('zh-Hans-CN');
    const result = await renderLocale();
    expect(result.current.locale).toBe('zh');
    expect(result.current.t('settings.title')).toBe('设置');
  });

  it('falls back to English for unsupported or missing device languages', async () => {
    deviceLanguage('fr-FR');
    expect((await renderLocale()).current.locale).toBe('en');

    deviceLanguage(null);
    expect((await renderLocale()).current.locale).toBe('en');
  });

  it('keeps the language the user picked over the device language', async () => {
    deviceLanguage('zh-CN');
    mockCache.store.set(LOCALE_KEY, { locale: 'en' });
    expect((await renderLocale()).current.locale).toBe('en');
  });

  it('ignores a stored value that is not a supported language', async () => {
    deviceLanguage('zh-CN');
    mockCache.store.set(LOCALE_KEY, { locale: 'constructor' });
    expect((await renderLocale()).current.locale).toBe('zh');
  });

  it('saves the picked language and switches translations', async () => {
    const result = await renderLocale();
    expect(result.current.t('settings.title')).toBe('Settings');

    await act(async () => {
      await result.current.setLocale('zh');
    });

    expect(result.current.locale).toBe('zh');
    expect(result.current.t('settings.title')).toBe('设置');
    expect(mockCache.store.get(LOCALE_KEY)).toEqual({ locale: 'zh' });
  });
});
