import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FullWindowOverlay } from 'react-native-screens';

import { Text } from '@/components/ui/text';
import { haptics } from '@/lib/haptics';

type ToastVariant = 'info' | 'success' | 'error';

type ToastInput = {
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastState = Required<ToastInput> & { id: number };

type ToastContextValue = {
  showToast: (input: ToastInput) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

// iOS presents modal screens in their own view controller, above the root view. The toast gets
// its own window there so it still shows over a modal such as the paywall.
const ToastLayer = Platform.OS === 'ios' ? FullWindowOverlay : React.Fragment;

const TOAST_BG_COLORS: Record<ToastVariant, string> = {
  info: '#111827',
  success: '#16a34a',
  error: '#dc2626',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = React.useState<ToastState | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = React.useCallback(
    ({ message, variant = 'info', durationMs = 2800 }: ToastInput) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (variant === 'success') haptics.success();
      else if (variant === 'error') haptics.error();

      setToast({ id: Date.now(), message, variant, durationMs });
      timeoutRef.current = setTimeout(() => {
        setToast(null);
        timeoutRef.current = null;
      }, durationMs);
    },
    []
  );

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      <View className="relative flex-1">
        {children}
        {toast ? (
          <ToastLayer>
            <View
              pointerEvents="box-none"
              className="absolute left-0 right-0 items-center px-4"
              style={{
                top: insets.top + 12,
                zIndex: 1000,
                elevation: 1000,
              }}>
              <Pressable
                onPress={hideToast}
                style={{
                  width: '100%',
                  maxWidth: 560,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: TOAST_BG_COLORS[toast.variant],
                  shadowColor: '#000000',
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                }}>
                <Text className="text-sm text-white">{toast.message}</Text>
              </Pressable>
            </View>
          </ToastLayer>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider.');
  }
  return context;
}
