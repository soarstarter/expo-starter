import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import * as React from 'react';

import { getCacheJson, setCacheJson } from '@/lib/cache';
import en from '@/lib/i18n/en.json';
import zh from '@/lib/i18n/zh.json';

const translations = { en, zh } as const;

export type SupportedLocale = keyof typeof translations;

const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

const LOCALE_CACHE_KEY = 'preferences.locale.v1';

type LocaleCache = {
  locale: SupportedLocale;
};

function isSupportedLocale(value: unknown): value is SupportedLocale {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(translations, value);
}

function normalizeLocale(locale: string | null | undefined): SupportedLocale {
  if (!locale) return 'en';
  const languageCode = locale.split('-')[0]?.toLowerCase() ?? 'en';
  return isSupportedLocale(languageCode) ? languageCode : 'en';
}

/** The language the user picked, or `null` when they never picked one. */
async function getStoredLocale(): Promise<SupportedLocale | null> {
  const stored = await getCacheJson<LocaleCache>(LOCALE_CACHE_KEY);
  return isSupportedLocale(stored?.locale) ? stored.locale : null;
}

async function setStoredLocale(locale: SupportedLocale) {
  await setCacheJson(LOCALE_CACHE_KEY, { locale } satisfies LocaleCache);
}

function setI18nLocale(locale: SupportedLocale) {
  i18n.locale = locale;
}

type I18nContextValue = {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => Promise<void>;
  t: typeof i18n.t;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<SupportedLocale>('en');
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const storedLocale = await getStoredLocale();
      const deviceLocale = normalizeLocale(Localization.getLocales()?.[0]?.languageTag);
      const initialLocale = storedLocale ?? deviceLocale;
      if (isMounted) {
        setLocaleState(initialLocale);
        setI18nLocale(initialLocale);
        setReady(true);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  const setLocale = React.useCallback(async (nextLocale: SupportedLocale) => {
    setLocaleState(nextLocale);
    setI18nLocale(nextLocale);
    await setStoredLocale(nextLocale);
  }, []);

  const value = React.useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: i18n.t.bind(i18n),
    }),
    [locale, setLocale]
  );

  if (!ready) {
    return null;
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = React.useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider.');
  }
  return context;
}
