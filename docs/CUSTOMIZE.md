# Customizing This Template

Three jobs turn the template into your app: give it your brand, connect the sign-in and paywall
screens to your backend, and remove the demo content. Do the brand change first; it is small and
easy to check on its own.

## Rebrand

| What                                 | Where                                                                                               |
| ------------------------------------ | --------------------------------------------------------------------------------------------------- |
| App name, slug, scheme               | `name`, `slug`, and `SCHEME` in `app.config.ts`                                                     |
| iOS bundle ID and Android package    | `BUNDLE_ID` in `app.config.ts`                                                                      |
| Permission texts                     | `faceIDPermission`, `userTrackingPermission`, and the `NS…UsageDescription` keys in `app.config.ts` |
| npm metadata                         | `name`, `version`, `description`, `author`, `homepage`, `repository`, `bugs` in `package.json`      |
| Display name in the UI               | `home.hero.title` and `onboarding.title` in `lib/i18n/en.json` and `lib/i18n/zh.json`               |
| Icon, adaptive icon, splash, favicon | `pnpm generate:assets path/to/icon.png` (a 1024×1024 PNG); splash colors in `app.config.ts`         |
| Brand color                          | `--primary` and `--ios-tint` in `global.css`, and `IOS_COLORS.tint` in `lib/theme.ts`               |
| Legal documents                      | `legal.*` keys in `lib/i18n/*.json`; optional hosted copies in `.env` (see `.env.example`)          |
| Deep-link examples                   | `__tests__/deep-links.test.ts`                                                                      |

The invite share sheet (`lib/referrals.ts`) reads the app name from `app.config.ts`, so it follows
the rename.

When you change the terms or privacy policy, also change `LEGAL_VERSION` in `lib/legal.ts`. The
consent gate asks every user to accept again when the version changes.

Check the result with `pnpm dev`, then with a local build (`pnpm exec expo run:ios` or
`pnpm exec expo run:android`). Expo Go always shows its own name and permission texts, so only a
local build shows your app name, icon, permission texts, and `your-scheme://` links.

## Connect your backend

The sign-in, sign-up, password reset, and paywall views in `components/auth/` and
`components/paywall/` only take callbacks. The route files pass callbacks that show a notice; replace
them with calls to your services. The README section
[Connect your own backend](../README.md#connect-your-own-backend) lists each file and callback.

When every screen is connected, delete `lib/ui-demo.ts` and the `uiDemo` keys in
`lib/i18n/*.json`, and point the guest card on the Me tab (`app/(tabs)/me.tsx`) at your signed-in
state.

## Remove the Showcase

1. Delete the Showcase screens, catalog, and tests:

   ```sh
   rm -rf "app/(tabs)/showcase.tsx" app/showcase lib/showcase
   rm __tests__/capability-catalog.test.ts __tests__/pro-catalog.test.ts
   ```

   `lib/showcase/pro-catalog.ts` is the list of SoarStarter Pro capabilities shown at the end of
   the Showcase, so it goes with the rest.

2. In `app/(tabs)/_layout.tsx`, remove the `showcase` tab screen and its drawer item.
3. In `app/(tabs)/index.tsx`, remove the "What's inside" section (`HOME_CATEGORIES` and the
   `openShowcase` handler), or point it at your own pages.
4. In `lib/deep-links.ts`, remove `/showcase` from `ALLOWED_STATIC_PATHS`, and update
   `__tests__/deep-links.test.ts`.
5. In `lib/i18n/en.json` and `lib/i18n/zh.json`, remove the `showcase`, `capabilityCategory`,
   `capabilityStatus`, and `pro` groups, and `tabs.showcase`.

## Remove the component gallery

1. Delete the gallery screens, catalog, and test:

   ```sh
   rm -rf "app/(tabs)/component.tsx" app/component lib/component
   rm __tests__/component-catalog.test.ts
   ```

2. In `app/(tabs)/_layout.tsx`, remove the `component` tab screen and its drawer item.
3. In `app/(tabs)/index.tsx`, remove the `components` entry from `DEMO_ACTIONS`.
4. In `lib/deep-links.ts`, remove `/component` from `ALLOWED_STATIC_PATHS`, and update
   `__tests__/deep-links.test.ts`.
5. Remove `tabs.component` and any other gallery-only keys from `lib/i18n/*.json`.

The components in `components/ui/` stay: the rest of the app uses them.

## Verify

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm format:check
```

`__tests__/i18n-locales.test.ts` fails if the English and Chinese files drift apart, so remove keys
from both. Then open each remaining tab in `pnpm dev`.
