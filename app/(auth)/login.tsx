import type { AuthActionResult } from '@/components/auth/types';
import { SignInForm } from '@/components/auth/sign-in-form';
import { SocialConnections } from '@/components/auth/social-connections';
import { KeyboardAwareScreen } from '@/components/ui/keyboard-aware-screen';
import { useUiDemoNotice } from '@/lib/ui-demo';
import * as React from 'react';
import { View } from 'react-native';

export default function LoginScreen() {
  const showUiDemoNotice = useUiDemoNotice();

  // UI only: connect these callbacks to your own auth service.
  const handleSignIn = React.useCallback(async (): Promise<AuthActionResult> => {
    showUiDemoNotice();
    return { ok: true };
  }, [showUiDemoNotice]);

  // Report success so the code entry step is visible.
  const handleSendLoginOtp = React.useCallback(
    async (): Promise<AuthActionResult> => ({ ok: true }),
    []
  );

  const handleVerifyLoginOtp = React.useCallback(async (): Promise<AuthActionResult> => {
    showUiDemoNotice();
    return { ok: true };
  }, [showUiDemoNotice]);

  return (
    <KeyboardAwareScreen>
      <View className="flex-1 justify-center px-6 py-10">
        <SignInForm
          onSignIn={handleSignIn}
          onSendLoginOtp={handleSendLoginOtp}
          onVerifyLoginOtp={handleVerifyLoginOtp}
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
