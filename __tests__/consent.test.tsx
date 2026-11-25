import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as React from 'react';

import { ConsentProvider, useConsent } from '@/lib/consent';
import { LEGAL_VERSION } from '@/lib/legal';
import { createMemoryCache } from '@/test/helpers/memory-cache';

const mockCache = createMemoryCache();

jest.mock('@/lib/cache', () => ({
  getCacheJson: (key: string) => mockCache.getCacheJson(key),
  setCacheJson: (key: string, value: unknown) => mockCache.setCacheJson(key, value),
}));

const CONSENT_KEY = 'legal.consent.v1';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ConsentProvider>{children}</ConsentProvider>;
}

async function renderConsent() {
  const hook = await renderHook(() => useConsent(), { wrapper });
  await waitFor(() => expect(hook.result.current.isHydrated).toBe(true));
  return hook;
}

beforeEach(() => {
  mockCache.store.clear();
});

describe('consent', () => {
  it('starts without consent on a fresh install', async () => {
    const { result } = await renderConsent();
    expect(result.current.acceptedVersion).toBeNull();
    expect(result.current.hasAcceptedCurrent).toBe(false);
  });

  it('records the current legal version when accepted', async () => {
    const { result } = await renderConsent();
    await act(async () => {
      await result.current.accept();
    });
    expect(result.current.acceptedVersion).toBe(LEGAL_VERSION);
    expect(result.current.hasAcceptedCurrent).toBe(true);
    expect(mockCache.store.get(CONSENT_KEY)).toMatchObject({ version: LEGAL_VERSION });
  });

  it('asks again when the stored consent is for an older version', async () => {
    mockCache.store.set(CONSENT_KEY, { version: '2000-01-01', acceptedAt: '2000-01-01' });
    const { result } = await renderConsent();
    expect(result.current.acceptedVersion).toBe('2000-01-01');
    expect(result.current.hasAcceptedCurrent).toBe(false);
  });

  it('restores consent for the current version', async () => {
    mockCache.store.set(CONSENT_KEY, { version: LEGAL_VERSION, acceptedAt: '2026-01-01' });
    const { result } = await renderConsent();
    expect(result.current.hasAcceptedCurrent).toBe(true);
  });

  it('reset clears the stored consent', async () => {
    mockCache.store.set(CONSENT_KEY, { version: LEGAL_VERSION, acceptedAt: '2026-01-01' });
    const { result } = await renderConsent();
    await act(async () => {
      await result.current.reset();
    });
    expect(result.current.hasAcceptedCurrent).toBe(false);
    expect(mockCache.store.get(CONSENT_KEY)).toBeNull();
  });

  it('throws a clear error outside the provider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(renderHook(() => useConsent())).rejects.toThrow(
      'useConsent must be used within a ConsentProvider.'
    );
    jest.mocked(console.error).mockRestore();
  });
});
