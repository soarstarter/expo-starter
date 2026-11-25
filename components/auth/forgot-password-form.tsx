import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/lib/auth-schemas';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/lib/toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

type ForgotPasswordFormProps = {
  initialEmail?: string;
  onSubmit: (email: string) => Promise<void> | void;
  isSubmitting: boolean;
  serverError?: string | null;
  info?: string | null;
};

export function ForgotPasswordForm({
  initialEmail = '',
  onSubmit,
  isSubmitting,
  serverError,
  info,
}: ForgotPasswordFormProps) {
  const { t } = useI18n();
  const { showToast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema(t)),
    defaultValues: { email: initialEmail },
  });

  const submit = handleSubmit(
    async ({ email }) => {
      await onSubmit(email);
    },
    (formErrors) => {
      const message = formErrors.email?.message;
      if (message) {
        showToast({ message, variant: 'error' });
      }
    }
  );

  return (
    <View className="gap-6">
      <Card className="border-border/0 shadow-none sm:border-border sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">
            {t('auth.forgotPasswordTitle')}
          </CardTitle>
          <CardDescription className="text-center sm:text-left">
            {t('auth.forgotPasswordSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Controller
                control={control}
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
                    returnKeyType="send"
                    onSubmitEditing={() => submit()}
                  />
                )}
              />
              {errors.email ? (
                <Text className="text-xs text-destructive">{errors.email.message}</Text>
              ) : null}
            </View>
            {serverError ? <Text className="text-sm text-destructive">{serverError}</Text> : null}
            {info ? <Text className="text-sm text-muted-foreground">{info}</Text> : null}
            <Button className="w-full" onPress={() => submit()} disabled={isSubmitting}>
              <Text>{isSubmitting ? t('auth.sendingResetCode') : t('auth.sendResetCode')}</Text>
            </Button>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
