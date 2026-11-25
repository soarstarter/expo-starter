import * as React from 'react';

import { getCacheJson, setCacheJson } from '@/lib/cache';

const ONBOARDING_CACHE_KEY = 'growth.onboarding.v1';

type OnboardingCache = {
  completed: boolean;
  completedAt?: string;
};

type OnboardingContextValue = {
  hasCompletedOnboarding: boolean;
  isHydrated: boolean;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
};

const OnboardingContext = React.createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState(false);
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    getCacheJson<OnboardingCache>(ONBOARDING_CACHE_KEY).then((stored) => {
      if (cancelled) return;
      setHasCompletedOnboarding(Boolean(stored?.completed));
      setIsHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const completeOnboarding = React.useCallback(async () => {
    setHasCompletedOnboarding(true);
    await setCacheJson(ONBOARDING_CACHE_KEY, {
      completed: true,
      completedAt: new Date().toISOString(),
    });
  }, []);

  const resetOnboarding = React.useCallback(async () => {
    setHasCompletedOnboarding(false);
    await setCacheJson(ONBOARDING_CACHE_KEY, { completed: false });
  }, []);

  const value = React.useMemo<OnboardingContextValue>(
    () => ({
      completeOnboarding,
      hasCompletedOnboarding,
      isHydrated,
      resetOnboarding,
    }),
    [completeOnboarding, hasCompletedOnboarding, isHydrated, resetOnboarding]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = React.useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider.');
  }
  return context;
}
