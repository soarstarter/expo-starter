import * as React from 'react';

import { getCacheJson, setCacheJson } from '@/lib/cache';
import { LEGAL_VERSION } from '@/lib/legal';

const CONSENT_CACHE_KEY = 'legal.consent.v1';

type ConsentCache = {
  version: string;
  acceptedAt: string;
};

type ConsentContextValue = {
  acceptedVersion: string | null;
  hasAcceptedCurrent: boolean;
  isHydrated: boolean;
  accept: () => Promise<void>;
  reset: () => Promise<void>;
};

const ConsentContext = React.createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [acceptedVersion, setAcceptedVersion] = React.useState<string | null>(null);
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    getCacheJson<ConsentCache>(CONSENT_CACHE_KEY).then((stored) => {
      if (cancelled) return;
      setAcceptedVersion(stored?.version ?? null);
      setIsHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const accept = React.useCallback(async () => {
    setAcceptedVersion(LEGAL_VERSION);
    await setCacheJson(CONSENT_CACHE_KEY, {
      version: LEGAL_VERSION,
      acceptedAt: new Date().toISOString(),
    });
  }, []);

  const reset = React.useCallback(async () => {
    setAcceptedVersion(null);
    await setCacheJson(CONSENT_CACHE_KEY, null);
  }, []);

  const value = React.useMemo<ConsentContextValue>(
    () => ({
      acceptedVersion,
      hasAcceptedCurrent: acceptedVersion === LEGAL_VERSION,
      isHydrated,
      accept,
      reset,
    }),
    [acceptedVersion, isHydrated, accept, reset]
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const context = React.useContext(ConsentContext);
  if (!context) {
    throw new Error('useConsent must be used within a ConsentProvider.');
  }
  return context;
}
