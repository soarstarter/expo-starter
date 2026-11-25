/** Outcome the auth forms expect from their submit callbacks. */
export type AuthActionResult = { ok: true } | { ok: false; error: string };

/** Sign-up also reports whether the account still needs its email confirmed by code. */
export type SignUpActionResult =
  | { ok: true; needsEmailConfirmation: boolean }
  | { ok: false; error: string };
