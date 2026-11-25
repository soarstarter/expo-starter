import {
  changePasswordSchema,
  forgotPasswordSchema,
  otpSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from '@/lib/auth-schemas';

// Echo the key so assertions can check which message a rule produced.
const t = (key: string) => key;

function firstError(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.success ? undefined : result.error?.issues[0]?.message;
}

describe('email fields', () => {
  it('trims and lower-cases the address', () => {
    const result = forgotPasswordSchema(t).safeParse({ email: '  Leo@Example.COM ' });
    expect(result.success && result.data.email).toBe('leo@example.com');
  });

  it.each(['', 'leo', 'leo@', '@example.com', 'leo@example', 'leo@example.c', 'le o@example.com'])(
    'rejects %j',
    (email) => {
      expect(firstError(forgotPasswordSchema(t).safeParse({ email }))).toBe('auth.invalidEmail');
    }
  );
});

describe('signInSchema', () => {
  it('only requires some password, without strength rules', () => {
    expect(signInSchema(t).safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
    expect(firstError(signInSchema(t).safeParse({ email: 'a@b.co', password: '' }))).toBe(
      'auth.emailAndPasswordRequired'
    );
  });
});

describe('new passwords', () => {
  const parse = (password: string) =>
    signUpSchema(t).safeParse({ name: ' Leo ', email: 'a@b.co', password });

  it('accepts eight characters with a letter and a number', () => {
    const result = parse('abcdefg1');
    expect(result.success).toBe(true);
    expect(result.success && result.data.name).toBe('Leo');
  });

  it('rejects passwords shorter than eight characters', () => {
    expect(firstError(parse('abc12'))).toBe('auth.passwordTooShort');
  });

  it.each(['abcdefgh', '12345678'])('rejects %j without both a letter and a number', (pw) => {
    expect(firstError(parse(pw))).toBe('auth.passwordNeedsLetterAndNumber');
  });

  it('applies the same rules when resetting or changing a password', () => {
    expect(firstError(resetPasswordSchema(t).safeParse({ password: 'short1', code: '1' }))).toBe(
      'auth.passwordTooShort'
    );
    expect(
      firstError(changePasswordSchema(t).safeParse({ currentPassword: 'x', password: 'abcdefgh' }))
    ).toBe('auth.passwordNeedsLetterAndNumber');
    expect(
      firstError(changePasswordSchema(t).safeParse({ currentPassword: '', password: 'abcdefg1' }))
    ).toBe('auth.currentPasswordRequired');
  });
});

describe('verification codes', () => {
  it('accepts exactly six digits, ignoring surrounding spaces', () => {
    expect(otpSchema(t).safeParse({ otp: ' 123456 ' }).success).toBe(true);
  });

  it.each(['12345', '1234567', '12a456', ''])('rejects %j', (otp) => {
    expect(firstError(otpSchema(t).safeParse({ otp }))).toBe('auth.enterOtp');
  });

  it('requires the reset code', () => {
    expect(firstError(resetPasswordSchema(t).safeParse({ password: 'abcdefg1', code: '  ' }))).toBe(
      'auth.enterOtp'
    );
  });
});
