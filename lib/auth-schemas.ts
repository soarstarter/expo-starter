import { z } from 'zod';

type Translator = (key: string) => string;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const emailField = (t: Translator) =>
  z
    .string()
    .trim()
    .toLowerCase()
    .refine((v) => EMAIL_PATTERN.test(v), { message: t('auth.invalidEmail') });

const passwordField = (t: Translator) =>
  z
    .string()
    .min(8, { message: t('auth.passwordTooShort') })
    .refine((v) => /[A-Za-z]/.test(v) && /[0-9]/.test(v), {
      message: t('auth.passwordNeedsLetterAndNumber'),
    });

export const signInSchema = (t: Translator) =>
  z.object({
    email: emailField(t),
    password: z.string().min(1, { message: t('auth.emailAndPasswordRequired') }),
  });

export const signUpSchema = (t: Translator) =>
  z.object({
    name: z.string().trim(),
    email: emailField(t),
    password: passwordField(t),
  });

export const otpSchema = (t: Translator) =>
  z.object({
    otp: z
      .string()
      .trim()
      .regex(/^\d{6}$/, { message: t('auth.enterOtp') }),
  });

export const loginOtpRequestSchema = (t: Translator) =>
  z.object({
    email: emailField(t),
  });

export const forgotPasswordSchema = (t: Translator) =>
  z.object({
    email: emailField(t),
  });

export const resetPasswordSchema = (t: Translator) =>
  z.object({
    password: passwordField(t),
    code: z
      .string()
      .trim()
      .min(1, { message: t('auth.enterOtp') }),
  });

export const changeEmailSchema = (t: Translator) =>
  z.object({
    email: emailField(t),
  });

export const changePasswordSchema = (t: Translator) =>
  z.object({
    currentPassword: z.string().min(1, { message: t('auth.currentPasswordRequired') }),
    password: passwordField(t),
  });

export type SignInValues = z.infer<ReturnType<typeof signInSchema>>;
export type SignUpValues = z.infer<ReturnType<typeof signUpSchema>>;
export type OtpValues = z.infer<ReturnType<typeof otpSchema>>;
export type LoginOtpRequestValues = z.infer<ReturnType<typeof loginOtpRequestSchema>>;
export type ForgotPasswordValues = z.infer<ReturnType<typeof forgotPasswordSchema>>;
export type ResetPasswordValues = z.infer<ReturnType<typeof resetPasswordSchema>>;
export type ChangeEmailValues = z.infer<ReturnType<typeof changeEmailSchema>>;
export type ChangePasswordValues = z.infer<ReturnType<typeof changePasswordSchema>>;
