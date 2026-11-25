import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { getCacheJson, setCacheJson } from '@/lib/cache';
import { useI18n } from '@/lib/i18n';
import * as LocalAuthentication from 'expo-local-authentication';
import { Fingerprint } from 'lucide-react-native';
import * as React from 'react';
import {
  AppState,
  type AppStateStatus,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { FullWindowOverlay } from 'react-native-screens';

const BIOMETRIC_ENABLED_KEY = 'cache.biometric.enabled.v1';
const LOCK_GRACE_PERIOD_MS = 30 * 1000;

type BiometricCapability = {
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
};

type BiometricContextValue = {
  capability: BiometricCapability;
  isEnabled: boolean;
  isLocked: boolean;
  setEnabled: (enabled: boolean) => Promise<{ ok: boolean; error?: string }>;
  unlock: () => Promise<{ ok: boolean; error?: string }>;
  lock: () => void;
};

const defaultCapability: BiometricCapability = {
  hasHardware: false,
  isEnrolled: false,
  supportedTypes: [],
};

const BiometricContext = React.createContext<BiometricContextValue | null>(null);

async function authenticate(promptMessage: string) {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: 'Cancel',
    fallbackLabel: '',
    disableDeviceFallback: false,
  });
  if (!result.success) {
    return {
      ok: false as const,
      error:
        ('error' in result && typeof result.error === 'string' && result.error) ||
        'Biometric authentication failed.',
    };
  }
  return { ok: true as const };
}

export function BiometricProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();

  const [capability, setCapability] = React.useState<BiometricCapability>(defaultCapability);
  const [isEnabled, setIsEnabledState] = React.useState(false);
  // Starts locked so a cold start with the switch on opens behind the lock.
  const [locked, setLocked] = React.useState(true);
  const isLocked = isEnabled && locked;
  const lastBackgroundedAt = React.useRef<number | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const [hasHardware, isEnrolled, supportedTypes, cached] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
        LocalAuthentication.supportedAuthenticationTypesAsync(),
        getCacheJson<boolean>(BIOMETRIC_ENABLED_KEY),
      ]);
      if (cancelled) return;
      setCapability({ hasHardware, isEnrolled, supportedTypes });
      setIsEnabledState(Boolean(cached));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!isEnabled) return;

    const handler = (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        lastBackgroundedAt.current = Date.now();
        return;
      }
      if (nextState === 'active' && lastBackgroundedAt.current) {
        const elapsed = Date.now() - lastBackgroundedAt.current;
        lastBackgroundedAt.current = null;
        if (elapsed > LOCK_GRACE_PERIOD_MS) {
          setLocked(true);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handler);
    return () => subscription.remove();
  }, [isEnabled]);

  const setEnabled = React.useCallback(
    async (next: boolean) => {
      if (next) {
        if (!capability.hasHardware) {
          return { ok: false, error: t('biometric.unavailable') };
        }
        if (!capability.isEnrolled) {
          return { ok: false, error: t('biometric.notEnrolled') };
        }
        const auth = await authenticate(t('biometric.enablePrompt'));
        if (!auth.ok) return auth;
      }
      await setCacheJson(BIOMETRIC_ENABLED_KEY, next);
      setLocked(next);
      setIsEnabledState(next);
      return { ok: true as const };
    },
    [capability, t]
  );

  const unlock = React.useCallback(async () => {
    const auth = await authenticate(t('biometric.unlockPrompt'));
    if (!auth.ok) return auth;
    setLocked(false);
    return { ok: true as const };
  }, [t]);

  const lock = React.useCallback(() => {
    if (isEnabled) setLocked(true);
  }, [isEnabled]);

  const value = React.useMemo<BiometricContextValue>(
    () => ({ capability, isEnabled, isLocked, setEnabled, unlock, lock }),
    [capability, isEnabled, isLocked, setEnabled, unlock, lock]
  );

  return <BiometricContext.Provider value={value}>{children}</BiometricContext.Provider>;
}

export function useBiometric() {
  const context = React.useContext(BiometricContext);
  if (!context) {
    throw new Error('useBiometric must be used within a BiometricProvider.');
  }
  return context;
}

// The lock has to sit above every screen, including routes presented as native modals.
// iOS cannot present a React Native modal over those, so it draws in its own window instead.
function LockLayer({ children }: { children: React.ReactNode }) {
  if (Platform.OS === 'ios') {
    return (
      <FullWindowOverlay>
        <View style={StyleSheet.absoluteFill}>{children}</View>
      </FullWindowOverlay>
    );
  }
  return (
    <Modal visible animationType="none" statusBarTranslucent onRequestClose={() => undefined}>
      {children}
    </Modal>
  );
}

export function BiometricGate() {
  const context = React.useContext(BiometricContext);
  const { t } = useI18n();

  if (!context || !context.isLocked) {
    return null;
  }

  return (
    <LockLayer>
      <View className="flex-1 items-center justify-center gap-4 bg-background px-8">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Icon as={Fingerprint} size={40} className="text-primary" />
        </View>
        <Text className="text-center text-xl font-semibold text-foreground">
          {t('biometric.lockedTitle')}
        </Text>
        <Text className="text-center text-sm text-muted-foreground">
          {t('biometric.lockedSubtitle')}
        </Text>
        <Pressable
          onPress={() => context.unlock()}
          className="mt-4 rounded-xl bg-primary px-6 py-3">
          <Text className="text-base font-semibold text-primary-foreground">
            {t('biometric.unlockAction')}
          </Text>
        </Pressable>
      </View>
    </LockLayer>
  );
}
