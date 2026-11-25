import type { AuthActionResult, SignUpActionResult } from '@/components/auth/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { otpSchema, signUpSchema, type OtpValues, type SignUpValues } from '@/lib/auth-schemas';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/lib/toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Platform, Pressable, TextInput, View } from 'react-native';

type SignUpFormProps = {
  onSignUp: (values: SignUpValues) => Promise<SignUpActionResult>;
  onVerifyEmailOtp: (input: { email: string; token: string }) => Promise<AuthActionResult>;
  onResendEmailOtp: (input: { email: string }) => Promise<AuthActionResult>;
  /** Social sign-in buttons, shown under the form on native platforms. */
  socialConnections?: React.ReactNode;
};

export function SignUpForm({
  onSignUp: signUp,
  onVerifyEmailOtp: verifyEmailOtp,
  onResendEmailOtp: resendEmailOtp,
  socialConnections,
}: SignUpFormProps) {
  const { t } = useI18n();
  const { showToast } = useToast();

  const emailInputRef = React.useRef<React.ComponentRef<typeof TextInput>>(null);
  const passwordInputRef = React.useRef<React.ComponentRef<typeof TextInput>>(null);

  const [step, setStep] = React.useState<'form' | 'verify'>('form');
  const [info, setInfo] = React.useState<string | null>(null);
  const [isResending, setIsResending] = React.useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema(t)),
    defaultValues: { name: '', email: '', password: '' },
  });

  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema(t)),
    defaultValues: { otp: '' },
  });

  const submittedEmail = signUpForm.getValues('email').trim().toLowerCase();

  function onNameSubmitEditing() {
    emailInputRef.current?.focus();
  }

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  const onSignUp = signUpForm.handleSubmit(
    async (values) => {
      setInfo(null);
      const result = await signUp(values);

      if (!result.ok) {
        signUpForm.setError('root', { message: result.error });
        showToast({ message: result.error, variant: 'error' });
        return;
      }

      if (result.needsEmailConfirmation) {
        setStep('verify');
        setInfo(t('auth.otpHint'));
        showToast({ message: t('auth.otpHint'), variant: 'info' });
      }
    },
    (formErrors) => {
      const message =
        formErrors.email?.message ??
        formErrors.password?.message ??
        formErrors.name?.message ??
        formErrors.root?.message;
      if (message) {
        showToast({ message, variant: 'error' });
      }
    }
  );

  const onVerify = otpForm.handleSubmit(
    async ({ otp }) => {
      setInfo(null);
      const result = await verifyEmailOtp({ email: submittedEmail, token: otp });

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

  const onResend = React.useCallback(async () => {
    setInfo(null);
    setIsResending(true);
    const result = await resendEmailOtp({ email: submittedEmail });
    setIsResending(false);

    if (!result.ok) {
      otpForm.setError('root', { message: result.error });
      showToast({ message: result.error, variant: 'error' });
      return;
    }

    setInfo(t('auth.resendHint'));
    showToast({ message: t('auth.resendHint'), variant: 'success' });
  }, [resendEmailOtp, submittedEmail, otpForm, t, showToast]);

  const isSubmitting =
    signUpForm.formState.isSubmitting || otpForm.formState.isSubmitting || isResending;

  const rootError =
    step === 'form' ? signUpForm.formState.errors.root : otpForm.formState.errors.root;

  return (
    <View className="gap-6">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">
            {t('auth.createAccountTitle')}
          </CardTitle>
          <CardDescription className="text-center sm:text-left">
            {t('auth.createAccountSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="name">{t('auth.name')}</Label>
              <Controller
                control={signUpForm.control}
                name="name"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input
                    id="name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Your name"
                    textContentType="name"
                    returnKeyType="next"
                    onSubmitEditing={onNameSubmitEditing}
                    editable={step === 'form'}
                  />
                )}
              />
            </View>

            <View className="gap-1.5">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Controller
                control={signUpForm.control}
                name="email"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input
                    ref={emailInputRef}
                    id="email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="m@example.com"
                    keyboardType="email-address"
                    autoComplete="email"
                    autoCapitalize="none"
                    returnKeyType="next"
                    submitBehavior="submit"
                    onSubmitEditing={onEmailSubmitEditing}
                    editable={step === 'form'}
                  />
                )}
              />
              {step === 'form' && signUpForm.formState.errors.email ? (
                <Text className="text-xs text-destructive">
                  {signUpForm.formState.errors.email.message}
                </Text>
              ) : null}
            </View>

            {step === 'form' ? (
              <View className="gap-1.5">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <View className="relative">
                  <Controller
                    control={signUpForm.control}
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
                        onSubmitEditing={() => onSignUp()}
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
                {signUpForm.formState.errors.password ? (
                  <Text className="text-xs text-destructive">
                    {signUpForm.formState.errors.password.message}
                  </Text>
                ) : null}
              </View>
            ) : (
              <View className="gap-1.5">
                <Label htmlFor="otp">{t('auth.emailCode')}</Label>
                <Controller
                  control={otpForm.control}
                  name="otp"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <Input
                      id="otp"
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
                      onSubmitEditing={() => onVerify()}
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

            {rootError ? (
              <Text className="text-sm text-destructive">{rootError.message}</Text>
            ) : null}
            {info ? <Text className="text-sm text-muted-foreground">{info}</Text> : null}

            {step === 'form' ? (
              <Button className="w-full" onPress={() => onSignUp()} disabled={isSubmitting}>
                <Text>{isSubmitting ? t('auth.creatingAccount') : t('common.createAccount')}</Text>
              </Button>
            ) : (
              <View className="gap-3">
                <Button className="w-full" onPress={() => onVerify()} disabled={isSubmitting}>
                  <Text>{isSubmitting ? t('auth.verifying') : t('common.verifyEmail')}</Text>
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onPress={onResend}
                  disabled={isSubmitting}>
                  <Text>{t('common.resendCode')}</Text>
                </Button>
              </View>
            )}
          </View>

          <Text className="text-center text-sm">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link href="/login" className="text-sm underline underline-offset-4">
              {t('common.signIn')}
            </Link>
          </Text>

          {Platform.OS !== 'web' && socialConnections && step === 'form' ? (
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
