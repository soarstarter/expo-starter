import type { AuthActionResult, SignUpActionResult } from '@/components/auth/types';
import { SignUpForm } from '@/components/auth/sign-up-form';
import { SocialConnections } from '@/components/auth/social-connections';
import { KeyboardAwareScreen } from '@/components/ui/keyboard-aware-screen';
import { useUiDemoNotice } from '@/lib/ui-demo';
import * as React from 'react';
import { View } from 'react-native';

export default function SignUpScreen() {
  const showUiDemoNotice = useUiDemoNotice();

  // UI only: connect these callbacks to your own auth service. Sign-up reports that the email
  // still needs confirming so the verification code step is visible.
  const handleSignUp = React.useCallback(
    async (): Promise<SignUpActionResult> => ({ ok: true, needsEmailConfirmation: true }),
    []
  );

  const handleVerifyEmailOtp = React.useCallback(async (): Promise<AuthActionResult> => {
    showUiDemoNotice();
    return { ok: true };
  }, [showUiDemoNotice]);

  const handleResendEmailOtp = React.useCallback(
    async (): Promise<AuthActionResult> => ({ ok: true }),
    []
  );

  return (
    <KeyboardAwareScreen>
      <View className="flex-1 justify-center px-6 py-10">
        <SignUpForm
          onSignUp={handleSignUp}
          onVerifyEmailOtp={handleVerifyEmailOtp}
          onResendEmailOtp={handleResendEmailOtp}
          socialConnections={
            <SocialConnections
              providers={['oauth_apple', 'oauth_google']}
              singleRow
              onPress={showUiDemoNotice}
            />
          }
        />
      </View>
    </KeyboardAwareScreen>
  );
}
