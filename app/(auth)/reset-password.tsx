import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { KeyboardAwareScreen } from '@/components/ui/keyboard-aware-screen';
import { Text } from '@/components/ui/text';
import { useI18n } from '@/lib/i18n';
import { useUiDemoNotice } from '@/lib/ui-demo';
import { Link, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

export default function ResetPasswordScreen() {
  const { t } = useI18n();
  const showUiDemoNotice = useUiDemoNotice();
  const params = useLocalSearchParams<{ email?: string }>();

  const email = typeof params.email === 'string' ? params.email : '';
  // UI only: verify the code and set the new password with your own auth service here.
  const handleSubmit = React.useCallback(async () => {
    showUiDemoNotice();
  }, [showUiDemoNotice]);

  return (
    <KeyboardAwareScreen>
      <View className="flex-1 justify-center px-6 py-10">
        <ResetPasswordForm email={email} onSubmit={handleSubmit} isSubmitting={false} />
        <View className="mt-4 flex-row items-center justify-center gap-2">
          <Text className="text-xs text-muted-foreground">{t('auth.backToSignInHint')}</Text>
          <Link href="/login" className="text-xs font-semibold text-foreground">
            {t('common.signIn')}
          </Link>
        </View>
      </View>
    </KeyboardAwareScreen>
  );
}
