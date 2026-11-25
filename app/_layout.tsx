import '@/global.css';

import { ConsentGate } from '@/components/consent-gate';
import { RootErrorBoundary } from '@/components/error-boundary';
import { OnboardingGate } from '@/components/growth-gates';
import { BiometricGate, BiometricProvider } from '@/lib/biometric';
import { ConsentProvider } from '@/lib/consent';
import { I18nProvider } from '@/lib/i18n';
import { OnboardingProvider } from '@/lib/onboarding';
import { getIOSColor, NAV_THEME } from '@/lib/theme';
import { ThemePreferenceProvider } from '@/lib/theme-preference';
import { ToastProvider } from '@/lib/toast';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PortalHost } from '@rn-primitives/portal';
import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export { ErrorBoundary } from '@/components/error-boundary';

// Guest-first: launch into the tabs. Without an anchor, Expo Router seeds the root stack from the
// first route in sort order when the launch URL carries no path, which is `(auth)/login`.
export const unstable_settings = {
  anchor: '(tabs)',
};

if (__DEV__) {
  // Keep the system accessibility preference; hide only its informational development warning.
  LogBox.ignoreLogs(['[Reanimated] Reduced motion setting is enabled on this device.']);
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const groupedBackground = getIOSColor('groupedBg', colorScheme === 'dark' ? 'dark' : 'light');

  return (
    <RootErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <SafeAreaProvider>
            <ConsentProvider>
              <OnboardingProvider>
                <I18nProvider>
                  <ThemePreferenceProvider>
                    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
                      <BiometricProvider>
                        <ToastProvider>
                          <BottomSheetModalProvider>
                            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                            <OnboardingGate />
                            <Stack
                              screenOptions={{
                                headerShown: false,
                                headerShadowVisible: false,
                                headerStyle: { backgroundColor: groupedBackground },
                                contentStyle: { backgroundColor: groupedBackground },
                              }}>
                              <Stack.Screen
                                name="paywall"
                                // Declared up front: the paywall turns on its header,
                                // and toggling it later remounts the modal.
                                options={{
                                  presentation: 'modal',
                                  headerShown: true,
                                  headerTransparent: true,
                                  title: '',
                                }}
                              />
                            </Stack>
                            <ConsentGate />
                            <BiometricGate />
                            <PortalHost />
                          </BottomSheetModalProvider>
                        </ToastProvider>
                      </BiometricProvider>
                    </ThemeProvider>
                  </ThemePreferenceProvider>
                </I18nProvider>
              </OnboardingProvider>
            </ConsentProvider>
          </SafeAreaProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </RootErrorBoundary>
  );
}
