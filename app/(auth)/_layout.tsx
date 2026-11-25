import { Icon } from '@/components/ui/icon';
import { useI18n } from '@/lib/i18n';
import { IOS_COLORS } from '@/lib/theme';
import { router, Stack } from 'expo-router';
import { ChevronLeft, X } from 'lucide-react-native';
import { Pressable } from 'react-native';

/**
 * Auth flow chrome. Mirrors the iOS AuthNavGraph: the login root shows a
 * close (X) that dismisses the on-demand sign-in back to the screen that
 * requested it (guest-first), while pushed sub-screens get a back chevron.
 */
export default function AuthLayout() {
  const { t } = useI18n();

  const dismiss = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        headerTitle: '',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: 'transparent' },
        headerLeft: () => (
          <Pressable
            onPress={dismiss}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('profile.cancel')}>
            <Icon as={ChevronLeft} size={28} color={IOS_COLORS.tint} />
          </Pressable>
        ),
      }}>
      <Stack.Screen
        name="login"
        options={{
          headerLeft: () => (
            <Pressable
              onPress={dismiss}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('profile.cancel')}>
              <Icon as={X} size={26} color={IOS_COLORS.tint} />
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}
