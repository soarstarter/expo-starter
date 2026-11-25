import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as React from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { BiometricProvider, useBiometric } from '@/lib/biometric';

const mockCache = new Map<string, unknown>();

jest.mock('@/lib/cache', () => ({
  getCacheJson: jest.fn(async (key: string) => mockCache.get(key) ?? null),
  setCacheJson: jest.fn(async (key: string, value: unknown) => {
    mockCache.set(key, value);
  }),
}));
jest.mock('@/lib/i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));
jest.mock('expo-local-authentication', () => ({
  AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2 },
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
  authenticateAsync: jest.fn(),
}));
jest.mock('react-native-css-interop/jsx-runtime', () => jest.requireActual('react/jsx-runtime'));
jest.mock('@/components/ui/icon', () => ({ Icon: () => null }));
jest.mock('@/components/ui/text', () => ({ Text: () => null }));
jest.mock('lucide-react-native', () => ({ Fingerprint: () => null }));

const ENABLED_KEY = 'cache.biometric.enabled.v1';
const auth = jest.mocked(LocalAuthentication);

function wrapper({ children }: { children: React.ReactNode }) {
  return <BiometricProvider>{children}</BiometricProvider>;
}

async function renderLock() {
  const hook = await renderHook(() => useBiometric(), { wrapper });
  await waitFor(() => expect(hook.result.current.capability.hasHardware).toBe(true));
  return hook;
}

let appStateHandler: ((state: AppStateStatus) => void) | null = null;

beforeEach(() => {
  jest.clearAllMocks();
  mockCache.clear();
  appStateHandler = null;
  auth.hasHardwareAsync.mockResolvedValue(true);
  auth.isEnrolledAsync.mockResolvedValue(true);
  auth.supportedAuthenticationTypesAsync.mockResolvedValue([2]);
  auth.authenticateAsync.mockResolvedValue({ success: true });
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, handler) => {
    appStateHandler = handler as (state: AppStateStatus) => void;
    return { remove: jest.fn() } as unknown as ReturnType<typeof AppState.addEventListener>;
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('app lock', () => {
  it('can be turned on without any signed-in user and locks right away', async () => {
    const { result } = await renderLock();
    expect(result.current.isEnabled).toBe(false);
    expect(result.current.isLocked).toBe(false);

    let outcome: { ok: boolean } | undefined;
    await act(async () => {
      outcome = await result.current.setEnabled(true);
    });

    expect(outcome).toEqual({ ok: true });
    expect(auth.authenticateAsync).toHaveBeenCalledTimes(1);
    expect(mockCache.get(ENABLED_KEY)).toBe(true);
    expect(result.current.isEnabled).toBe(true);
    expect(result.current.isLocked).toBe(true);
  });

  it('locks on cold start when the switch was left on', async () => {
    mockCache.set(ENABLED_KEY, true);
    const { result } = await renderLock();
    await waitFor(() => expect(result.current.isLocked).toBe(true));
  });

  it('stays locked when authentication fails and unlocks when it succeeds', async () => {
    mockCache.set(ENABLED_KEY, true);
    const { result } = await renderLock();
    await waitFor(() => expect(result.current.isLocked).toBe(true));

    auth.authenticateAsync.mockResolvedValueOnce({ success: false, error: 'user_cancel' });
    let failed: { ok: boolean; error?: string } | undefined;
    await act(async () => {
      failed = await result.current.unlock();
    });
    expect(failed).toEqual({ ok: false, error: 'user_cancel' });
    expect(result.current.isLocked).toBe(true);

    await act(async () => {
      await result.current.unlock();
    });
    expect(result.current.isLocked).toBe(false);
  });

  it('refuses to turn on without hardware or enrolment', async () => {
    auth.isEnrolledAsync.mockResolvedValue(false);
    const { result } = await renderLock();

    let outcome: { ok: boolean; error?: string } | undefined;
    await act(async () => {
      outcome = await result.current.setEnabled(true);
    });

    expect(outcome).toEqual({ ok: false, error: 'biometric.notEnrolled' });
    expect(auth.authenticateAsync).not.toHaveBeenCalled();
    expect(result.current.isEnabled).toBe(false);
    expect(mockCache.has(ENABLED_KEY)).toBe(false);
  });

  it('relocks only after the app was in the background past the grace period', async () => {
    mockCache.set(ENABLED_KEY, true);
    const now = jest.spyOn(Date, 'now');
    const { result } = await renderLock();
    await waitFor(() => expect(result.current.isLocked).toBe(true));
    await act(async () => {
      await result.current.unlock();
    });

    now.mockReturnValue(1_000);
    await act(async () => appStateHandler?.('background'));
    now.mockReturnValue(1_000 + 10_000);
    await act(async () => appStateHandler?.('active'));
    expect(result.current.isLocked).toBe(false);

    now.mockReturnValue(50_000);
    await act(async () => appStateHandler?.('background'));
    now.mockReturnValue(50_000 + 31_000);
    await act(async () => appStateHandler?.('active'));
    expect(result.current.isLocked).toBe(true);
  });

  it('turning off clears the lock and the stored switch', async () => {
    mockCache.set(ENABLED_KEY, true);
    const { result } = await renderLock();
    await waitFor(() => expect(result.current.isLocked).toBe(true));

    await act(async () => {
      await result.current.setEnabled(false);
    });

    expect(auth.authenticateAsync).not.toHaveBeenCalled();
    expect(mockCache.get(ENABLED_KEY)).toBe(false);
    expect(result.current.isEnabled).toBe(false);
    expect(result.current.isLocked).toBe(false);
  });
});
