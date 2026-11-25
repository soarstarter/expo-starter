import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { KeyboardAwareScreen } from '@/components/ui/keyboard-aware-screen';
import { Text } from '@/components/ui/text';
import { useI18n } from '@/lib/i18n';
import { useUiDemoNotice } from '@/lib/ui-demo';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

export default function ForgotPasswordScreen() {
  const { t } = useI18n();
  const showUiDemoNotice = useUiDemoNotice();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();

  const initialEmail = typeof params.email === 'string' ? params.email : '';
  // UI only: send the reset code from your own auth service here. The reset screen still opens
  // so the whole flow is visible.
  const handleSubmit = React.useCallback(
    async (email: string) => {
      showUiDemoNotice();
      router.push({
        pathname: '/reset-password',
        params: { email },
      });
    },
    [router, showUiDemoNotice]
  );

  return (
    <KeyboardAwareScreen>
      <View className="flex-1 justify-center px-6 py-10">
        <ForgotPasswordForm
          initialEmail={initialEmail}
          onSubmit={handleSubmit}
          isSubmitting={false}
        />
        <View className="mt-4 flex-row items-center justify-center gap-2">
          <Text className="text-xs text-muted-foreground">{t('auth.rememberedPassword')}</Text>
          <Link href="/login" className="text-xs font-semibold text-foreground">
            {t('common.signIn')}
          </Link>
        </View>
      </View>
    </KeyboardAwareScreen>
  );
}
