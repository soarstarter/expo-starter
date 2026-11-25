import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as React from 'react';

import { OnboardingProvider, useOnboarding } from '@/lib/onboarding';
import { createMemoryCache } from '@/test/helpers/memory-cache';

const mockCache = createMemoryCache();

jest.mock('@/lib/cache', () => ({
  getCacheJson: (key: string) => mockCache.getCacheJson(key),
  setCacheJson: (key: string, value: unknown) => mockCache.setCacheJson(key, value),
}));

const ONBOARDING_KEY = 'growth.onboarding.v1';

function wrapper({ children }: { children: React.ReactNode }) {
  return <OnboardingProvider>{children}</OnboardingProvider>;
}

async function renderOnboarding() {
  const hook = await renderHook(() => useOnboarding(), { wrapper });
  await waitFor(() => expect(hook.result.current.isHydrated).toBe(true));
  return hook;
}

beforeEach(() => {
  mockCache.store.clear();
});

describe('onboarding', () => {
  it('is not completed on a fresh install', async () => {
    const { result } = await renderOnboarding();
    expect(result.current.hasCompletedOnboarding).toBe(false);
  });

  it('remembers completion', async () => {
    const { result } = await renderOnboarding();
    await act(async () => {
      await result.current.completeOnboarding();
    });
    expect(result.current.hasCompletedOnboarding).toBe(true);
    expect(mockCache.store.get(ONBOARDING_KEY)).toMatchObject({ completed: true });
  });

  it('restores completion on the next launch', async () => {
    mockCache.store.set(ONBOARDING_KEY, { completed: true, completedAt: '2026-01-01' });
    const { result } = await renderOnboarding();
    expect(result.current.hasCompletedOnboarding).toBe(true);
  });

  it('reset shows onboarding again', async () => {
    mockCache.store.set(ONBOARDING_KEY, { completed: true });
    const { result } = await renderOnboarding();
    await act(async () => {
      await result.current.resetOnboarding();
    });
    expect(result.current.hasCompletedOnboarding).toBe(false);
    expect(mockCache.store.get(ONBOARDING_KEY)).toEqual({ completed: false });
  });

  it('throws a clear error outside the provider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(renderHook(() => useOnboarding())).rejects.toThrow(
      'useOnboarding must be used within an OnboardingProvider.'
    );
    jest.mocked(console.error).mockRestore();
  });
});
