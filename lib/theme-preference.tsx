import { colorScheme as nativewindColorScheme, useColorScheme } from 'nativewind';
import * as React from 'react';
import { Platform } from 'react-native';

import { getCacheJson, setCacheJson } from '@/lib/cache';

const THEME_CACHE_KEY = 'preferences.theme.v1';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemeCache = {
  theme: ThemePreference;
};

type ThemePreferenceContextValue = {
  theme: ThemePreference;
  isHydrated: boolean;
  setTheme: (theme: ThemePreference) => Promise<void>;
};

const ThemePreferenceContext = React.createContext<ThemePreferenceContextValue | null>(null);

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function ThemePreferenceProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemePreference>('system');
  const [isHydrated, setIsHydrated] = React.useState(false);
  const { colorScheme } = useColorScheme();

  // On web, NativeWind adds the `dark` class to <html> only for an explicit light or dark
  // choice, so with 'system' the CSS variables would stay light while the system is dark.
  // Keep the class in step with the resolved scheme. Each `nativewindColorScheme.set` call
  // below is followed by a change to `theme` or `isHydrated`, so both are dependencies:
  // setting 'system' on a dark system removes the class without changing `colorScheme`.
  React.useEffect(() => {
    if (Platform.OS !== 'web') return;
    document.documentElement.classList.toggle('dark', colorScheme === 'dark');
  }, [colorScheme, theme, isHydrated]);

  React.useEffect(() => {
    let cancelled = false;

    getCacheJson<ThemeCache>(THEME_CACHE_KEY).then((stored) => {
      if (cancelled) return;
      if (stored && isThemePreference(stored.theme)) {
        setThemeState(stored.theme);
        nativewindColorScheme.set(stored.theme);
      }
      setIsHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const setTheme = React.useCallback(async (next: ThemePreference) => {
    setThemeState(next);
    nativewindColorScheme.set(next);
    await setCacheJson(THEME_CACHE_KEY, { theme: next } satisfies ThemeCache);
  }, []);

  const value = React.useMemo<ThemePreferenceContextValue>(
    () => ({ isHydrated, setTheme, theme }),
    [isHydrated, setTheme, theme]
  );

  return (
    <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  const context = React.useContext(ThemePreferenceContext);
  if (!context) {
    throw new Error('useThemePreference must be used within a ThemePreferenceProvider.');
  }
  return context;
}
