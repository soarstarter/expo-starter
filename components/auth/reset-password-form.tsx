import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { resetPasswordSchema, type ResetPasswordValues } from '@/lib/auth-schemas';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/lib/toast';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TextInput, View } from 'react-native';

type ResetPasswordFormProps = {
  email: string;
  onSubmit: (values: { password: string; code: string }) => Promise<void> | void;
  isSubmitting: boolean;
  serverError?: string | null;
  info?: string | null;
};

export function ResetPasswordForm({
  email,
  onSubmit,
  isSubmitting,
  serverError,
  info,
}: ResetPasswordFormProps) {
  const { t } = useI18n();
  const { showToast } = useToast();
  const codeInputRef = React.useRef<React.ComponentRef<typeof TextInput>>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema(t)),
    defaultValues: { password: '', code: '' },
  });

  const submit = handleSubmit(
    async (values) => {
      await onSubmit(values);
    },
    (formErrors) => {
      const message = formErrors.password?.message ?? formErrors.code?.message;
      if (message) {
        showToast({ message, variant: 'error' });
      }
    }
  );

  function onPasswordSubmitEditing() {
    codeInputRef.current?.focus();
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">
            {t('auth.resetPasswordTitle')}
          </CardTitle>
          <CardDescription className="text-center sm:text-left">
            {t('auth.resetPasswordSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input id="email" value={email} editable={false} />
            </View>
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">{t('auth.newPassword')}</Label>
              </View>
              <Controller
                control={control}
                name="password"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input
                    id="password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    returnKeyType="next"
                    submitBehavior="submit"
                    onSubmitEditing={onPasswordSubmitEditing}
                  />
                )}
              />
              {errors.password ? (
                <Text className="text-xs text-destructive">{errors.password.message}</Text>
              ) : null}
            </View>
            <View className="gap-1.5">
              <Label htmlFor="code">{t('auth.verificationCode')}</Label>
              <Controller
                control={control}
                name="code"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input
                    ref={codeInputRef}
                    id="code"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    returnKeyType="send"
                    keyboardType="numeric"
                    autoComplete="sms-otp"
                    textContentType="oneTimeCode"
                    onSubmitEditing={() => submit()}
                  />
                )}
              />
              {errors.code ? (
                <Text className="text-xs text-destructive">{errors.code.message}</Text>
              ) : null}
            </View>
            {serverError ? <Text className="text-sm text-destructive">{serverError}</Text> : null}
            {info ? <Text className="text-sm text-muted-foreground">{info}</Text> : null}
            <Button className="w-full" onPress={() => submit()} disabled={isSubmitting}>
              <Text>
                {isSubmitting ? t('auth.resettingPassword') : t('auth.resetPasswordAction')}
              </Text>
            </Button>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
