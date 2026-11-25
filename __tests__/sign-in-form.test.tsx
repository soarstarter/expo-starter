import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as React from 'react';

import { SignInForm } from '@/components/auth/sign-in-form';
import { I18nProvider } from '@/lib/i18n';
import { ToastProvider } from '@/lib/toast';
import { createMemoryCache } from '@/test/helpers/memory-cache';

const mockCache = createMemoryCache();

jest.mock('@/lib/cache', () => ({
  getCacheJson: (key: string) => mockCache.getCacheJson(key),
  setCacheJson: (key: string, value: unknown) => mockCache.setCacheJson(key, value),
}));
jest.mock('expo-localization', () => ({ getLocales: () => [{ languageTag: 'en-US' }] }));
jest.mock('expo-router', () => {
  const { Text } = jest.requireActual('react-native');
  return {
    Link: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
    useRouter: () => ({ push: jest.fn() }),
  };
});
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

function renderForm() {
  const callbacks = {
    onSignIn: jest.fn(async () => ({ ok: true as const })),
    onSendLoginOtp: jest.fn(async () => ({ ok: true as const })),
    onVerifyLoginOtp: jest.fn(async () => ({ ok: true as const })),
  };
  const result = render(
    <I18nProvider>
      <ToastProvider>
        <SignInForm {...callbacks} />
      </ToastProvider>
    </I18nProvider>
  );
  return { ...callbacks, result };
}

beforeEach(() => {
  mockCache.store.clear();
});

describe('SignInForm', () => {
  it('keeps the code tab inputs bound to their own forms after switching tabs', async () => {
    const { onSendLoginOtp, onVerifyLoginOtp, result } = renderForm();
    await result;

    await fireEvent.press(await screen.findByText('Code'));
    await fireEvent.changeText(screen.getByPlaceholderText('m@example.com'), 'demo@example.com');
    await fireEvent.press(screen.getByText('Send login code'));

    await waitFor(() => expect(onSendLoginOtp).toHaveBeenCalledWith({ email: 'demo@example.com' }));

    await fireEvent.changeText(await screen.findByPlaceholderText('123456'), '654321');
    await fireEvent.press(screen.getByText('Sign in'));

    await waitFor(() =>
      expect(onVerifyLoginOtp).toHaveBeenCalledWith({
        email: 'demo@example.com',
        token: '654321',
      })
    );
  });
});
