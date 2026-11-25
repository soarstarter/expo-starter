import type { AuthActionResult } from '@/components/auth/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import {
  loginOtpRequestSchema,
  otpSchema,
  signInSchema,
  type LoginOtpRequestValues,
  type OtpValues,
  type SignInValues,
} from '@/lib/auth-schemas';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/lib/toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Platform, Pressable, type TextInput, View } from 'react-native';

type SignInMode = 'password' | 'otp';
type OtpDestination = {
  email: string;
};

type SignInFormProps = {
  onSignIn: (values: SignInValues) => Promise<AuthActionResult>;
  onSendLoginOtp: (input: OtpDestination) => Promise<AuthActionResult>;
  onVerifyLoginOtp: (input: OtpDestination & { token: string }) => Promise<AuthActionResult>;
  /** Social sign-in buttons, shown under the form on native platforms. */
  socialConnections?: React.ReactNode;
};

export function SignInForm({
  onSignIn,
  onSendLoginOtp: sendLoginOtp,
  onVerifyLoginOtp: verifyLoginOtp,
  socialConnections,
}: SignInFormProps) {
  const { t } = useI18n();
  const { showToast } = useToast();
  const router = useRouter();

  const passwordInputRef = React.useRef<React.ComponentRef<typeof TextInput>>(null);
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [mode, setMode] = React.useState<SignInMode>('password');
  const [otpStep, setOtpStep] = React.useState<'request' | 'verify'>('request');
  const [otpDestination, setOtpDestination] = React.useState<OtpDestination | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [isResending, setIsResending] = React.useState(false);

  const passwordForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema(t)),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const otpRequestForm = useForm<LoginOtpRequestValues>({
    resolver: zodResolver(loginOtpRequestSchema(t)),
    defaultValues: {
      email: '',
    },
  });

  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema(t)),
    defaultValues: { otp: '' },
  });

  const isOtpBusy =
    otpRequestForm.formState.isSubmitting || otpForm.formState.isSubmitting || isResending;

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  const handleModeChange = React.useCallback((nextMode: SignInMode) => {
    setMode(nextMode);
    setInfo(null);
  }, []);

  const onSubmitPassword = passwordForm.handleSubmit(
    async (values) => {
      const result = await onSignIn(values);
      if (!result.ok) {
        passwordForm.setError('root', { message: result.error });
        showToast({ message: result.error, variant: 'error' });
      }
    },
    (formErrors) => {
      const message =
        formErrors.email?.message ?? formErrors.password?.message ?? formErrors.root?.message;
      if (message) {
        showToast({ message, variant: 'error' });
      }
    }
  );

  const onSendLoginOtp = otpRequestForm.handleSubmit(
    async (values) => {
      setInfo(null);
      const destination: OtpDestination = { email: values.email.trim().toLowerCase() };

      const result = await sendLoginOtp(destination);
      if (!result.ok) {
        otpRequestForm.setError('root', { message: result.error });
        showToast({ message: result.error, variant: 'error' });
        return;
      }

      setOtpDestination(destination);
      setOtpStep('verify');
      otpForm.reset({ otp: '' });
      const message = 'Code sent to your email.';
      setInfo(message);
      showToast({ message, variant: 'success' });
    },
    (formErrors) => {
      const message = formErrors.email?.message;
      if (message) {
        showToast({ message, variant: 'error' });
      }
    }
  );

  const onVerifyLoginOtp = otpForm.handleSubmit(
    async ({ otp }) => {
      setInfo(null);
      if (!otpDestination) {
        const message = 'Request a code first.';
        otpForm.setError('root', { message });
        showToast({ message, variant: 'error' });
        return;
      }

      const result = await verifyLoginOtp({ ...otpDestination, token: otp });
      if (!result.ok) {
        otpForm.setError('root', { message: result.error });
        showToast({ message: result.error, variant: 'error' });
      }
    },
    (formErrors) => {
      const message = formErrors.otp?.message ?? formErrors.root?.message;
      if (message) {
        showToast({ message, variant: 'error' });
      }
    }
  );

  const onResendLoginOtp = React.useCallback(async () => {
    if (!otpDestination) {
      await onSendLoginOtp();
      return;
    }

    setInfo(null);
    setIsResending(true);
    const result = await sendLoginOtp(otpDestination);
    setIsResending(false);

    if (!result.ok) {
      otpForm.setError('root', { message: result.error });
      showToast({ message: result.error, variant: 'error' });
      return;
    }

    const message = 'Code sent to your email.';
    setInfo(message);
    showToast({ message, variant: 'success' });
  }, [onSendLoginOtp, otpDestination, otpForm, sendLoginOtp, showToast]);

  const rootError =
    mode === 'password'
      ? passwordForm.formState.errors.root?.message
      : otpStep === 'request'
        ? otpRequestForm.formState.errors.root?.message
        : otpForm.formState.errors.root?.message;

  return (
    <View className="gap-6">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">
            {t('auth.welcomeBack')}
          </CardTitle>
          <CardDescription className="text-center sm:text-left">
            {t('auth.signInSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="flex-row rounded-lg border border-border bg-muted p-1">
              {[
                { label: t('auth.password'), value: 'password' as const },
                { label: t('auth.code'), value: 'otp' as const },
              ].map((option) => {
                const selected = mode === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => handleModeChange(option.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className={
                      'flex-1 rounded-md px-3 py-2 ' + (selected ? 'bg-background' : 'bg-muted')
                    }>
                    <Text
                      className={
                        'text-center text-sm font-medium ' +
                        (selected ? 'text-foreground' : 'text-muted-foreground')
                      }>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Keys keep React from reusing one tab's field (and its form binding) for another. */}
            {mode === 'password' ? (
              <>
                <View key="password-email" className="gap-1.5">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <Controller
                    control={passwordForm.control}
                    name="email"
                    render={({ field: { value, onChange, onBlur } }) => (
                      <Input
                        id="email"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="m@example.com"
                        keyboardType="email-address"
                        autoComplete="email"
                        autoCapitalize="none"
                        onSubmitEditing={onEmailSubmitEditing}
                        returnKeyType="next"
                        submitBehavior="submit"
                      />
                    )}
                  />
                  {passwordForm.formState.errors.email ? (
                    <Text className="text-xs text-destructive">
                      {passwordForm.formState.errors.email.message}
                    </Text>
                  ) : null}
                </View>
                <View className="gap-1.5">
                  <View className="flex-row items-center">
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <Button
                      variant="link"
                      size="sm"
                      className="ml-auto h-4 px-1 py-0 web:h-fit sm:h-4"
                      onPress={() => {
                        router.push({
                          pathname: '/forgot-password',
                          params: {
                            email: passwordForm.getValues('email').trim().toLowerCase(),
                          },
                        });
                      }}>
                      <Text className="font-normal leading-4">{t('auth.forgotPassword')}</Text>
                    </Button>
                  </View>
                  <View className="relative">
                    <Controller
                      control={passwordForm.control}
                      name="password"
                      render={({ field: { value, onChange, onBlur } }) => (
                        <Input
                          ref={passwordInputRef}
                          id="password"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          secureTextEntry={!isPasswordVisible}
                          returnKeyType="send"
                          onSubmitEditing={() => onSubmitPassword()}
                          className="pr-10"
                        />
                      )}
                    />
                    <Pressable
                      className="absolute bottom-0 right-3 top-0 items-center justify-center"
                      onPress={() => setIsPasswordVisible((prev) => !prev)}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={t('auth.password')}
                      accessibilityState={{ expanded: isPasswordVisible }}>
                      <Icon
                        as={isPasswordVisible ? EyeOff : Eye}
                        size={16}
                        className="text-muted-foreground"
                      />
                    </Pressable>
                  </View>
                  {passwordForm.formState.errors.password ? (
                    <Text className="text-xs text-destructive">
                      {passwordForm.formState.errors.password.message}
                    </Text>
                  ) : null}
                </View>
              </>
            ) : (
              <>
                {otpStep === 'request' ? (
                  <View key="otp-email" className="gap-1.5">
                    <Label htmlFor="otp-email">{t('auth.email')}</Label>
                    <Controller
                      control={otpRequestForm.control}
                      name="email"
                      render={({ field: { value, onChange, onBlur } }) => (
                        <Input
                          id="otp-email"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="m@example.com"
                          keyboardType="email-address"
                          autoComplete="email"
                          autoCapitalize="none"
                          returnKeyType="send"
                          onSubmitEditing={() => onSendLoginOtp()}
                        />
                      )}
                    />
                    {otpRequestForm.formState.errors.email ? (
                      <Text className="text-xs text-destructive">
                        {otpRequestForm.formState.errors.email.message}
                      </Text>
                    ) : null}
                  </View>
                ) : (
                  <View key="otp-code" className="gap-1.5">
                    <Label htmlFor="login-otp">{t('auth.verificationCode')}</Label>
                    <Controller
                      control={otpForm.control}
                      name="otp"
                      render={({ field: { value, onChange, onBlur } }) => (
                        <Input
                          id="login-otp"
                          value={value}
                          onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, 6))}
                          onBlur={onBlur}
                          placeholder="123456"
                          keyboardType="number-pad"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          textContentType="oneTimeCode"
                          autoCapitalize="none"
                          maxLength={6}
                          returnKeyType="send"
                          onSubmitEditing={() => onVerifyLoginOtp()}
                        />
                      )}
                    />
                    {otpForm.formState.errors.otp ? (
                      <Text className="text-xs text-destructive">
                        {otpForm.formState.errors.otp.message}
                      </Text>
                    ) : null}
                  </View>
                )}
              </>
            )}

            {rootError ? <Text className="text-sm text-destructive">{rootError}</Text> : null}
            {info ? <Text className="text-sm text-muted-foreground">{info}</Text> : null}

            {mode === 'password' ? (
              <Button
                className="w-full"
                onPress={() => onSubmitPassword()}
                disabled={passwordForm.formState.isSubmitting}>
                <Text>
                  {passwordForm.formState.isSubmitting ? t('auth.signingIn') : t('common.signIn')}
                </Text>
              </Button>
            ) : otpStep === 'request' ? (
              <Button className="w-full" onPress={() => onSendLoginOtp()} disabled={isOtpBusy}>
                <Text>{isOtpBusy ? t('auth.sendingCode') : t('auth.sendLoginCode')}</Text>
              </Button>
            ) : (
              <View className="gap-3">
                <Button className="w-full" onPress={() => onVerifyLoginOtp()} disabled={isOtpBusy}>
                  <Text>{isOtpBusy ? t('auth.verifying') : t('common.signIn')}</Text>
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onPress={onResendLoginOtp}
                  disabled={isOtpBusy}>
                  <Text>{t('common.resendCode')}</Text>
                </Button>
              </View>
            )}
          </View>

          <Text className="text-center text-sm">
            {t('auth.newHere')}{' '}
            <Link href="/sign-up" className="text-sm underline underline-offset-4">
              {t('common.createAccount')}
            </Link>
          </Text>

          {Platform.OS !== 'web' &&
          socialConnections &&
          (mode === 'password' || otpStep === 'request') ? (
            <>
              <View className="flex-row items-center">
                <Separator className="flex-1" />
                <Text className="px-4 text-sm text-muted-foreground">or</Text>
                <Separator className="flex-1" />
              </View>
              {socialConnections}
            </>
          ) : null}
        </CardContent>
      </Card>
    </View>
  );
}
