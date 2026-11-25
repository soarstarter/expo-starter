# Repository Guidelines

## Project Structure & Module Organization

Expo Starter is an Expo Router React Native app (Expo SDK 58, React Native 0.88) with no backend:
the app makes no network requests. Key paths:

- `app/` routes and screens (Expo Router file-based navigation). `(tabs)/` holds the Home,
  Components, Showcase, and Me tabs; `(auth)/` the sign-in, sign-up, and password screens.
- `components/` reusable UI. `components/ui/` holds React Native Reusables components;
  `components/auth/` and `components/paywall/` are views that only take callbacks.
- `lib/` providers and helpers (i18n, theme, consent, onboarding, app lock, deep links, local cache).
  Translations live in `lib/i18n/en.json` and `lib/i18n/zh.json`.
- `lib/showcase/` and `lib/component/` are the catalogs behind the Showcase and component gallery.
- `__tests__/` Jest tests; `test/helpers/` shared test helpers.
- `assets/` images; `global.css` Tailwind/NativeWind theme variables.
- Config: `app.config.ts`, `babel.config.js`, `metro.config.js`, `tailwind.config.js`,
  `tsconfig.json`, `jest.config.js`.

## Build, Test, and Development Commands

This repo uses **pnpm** (lockfile is `pnpm-lock.yaml`, `packageManager` pinned in `package.json`).
Use `pnpm`, not `npm`, so the lockfile stays authoritative.

- `pnpm install` installs dependencies.
- `pnpm dev` starts Metro with a clean cache; open the app in Expo Go or press `i`, `a`, or `w`.
- `pnpm ios` / `pnpm android` / `pnpm web` start Metro and open that platform.
- `pnpm typecheck` runs `tsc --noEmit`.
- `pnpm lint` runs `expo lint` (eslint-config-expo).
- `pnpm test` runs the Jest suite.
- `pnpm format` / `pnpm format:check` runs Prettier.
- `pnpm exec expo install --check` checks Expo SDK dependency versions.
- `pnpm check:lite` checks the rules in `lite-manifest.json`: no backend SDKs, network calls, OTA or
  EAS settings, or secrets. It needs gitleaks; `--skip-secrets` skips the secret scan. It also runs
  as a pre-push hook and in CI.
- `pnpm generate:assets <png>` regenerates the icon, splash, and favicon from one image.
- `pnpm clean` removes `.expo` and `node_modules` (on Windows use PowerShell
  `Remove-Item -Recurse -Force .expo,node_modules`).

The app runs in Expo Go; no `.env` file and no development build are needed.

## Coding Style & Naming Conventions

- Indentation: 2 spaces; max line width 100; single quotes.
- Formatting: Prettier with `prettier-plugin-tailwindcss` (Tailwind class sorting).
- TypeScript strict mode. Path alias `@/` maps to the repository root.
- Style with NativeWind `className`; theme colors come from `global.css` and `lib/theme.ts`.
- File naming: follow Expo Router conventions in `app/`; other modules use `kebab-case.ts(x)`.
- Every user-facing string goes in both locale files through `useI18n().t(...)`.

## Architecture Notes

- The sign-in, sign-up, password reset, and paywall screens are UI only. Their views take callbacks;
  the route files in `app/(auth)/` and `app/paywall.tsx` pass callbacks that call
  `useUiDemoNotice()` from `lib/ui-demo.ts`. Keep service calls out of the view components.
- Do not add network requests (`fetch`, `XMLHttpRequest`, `WebSocket`, HTTP clients) or backend
  SDKs. `pnpm check:lite` rejects them.
- Persist small preferences with `getCacheJson` / `setCacheJson` from `lib/cache.ts`, using a
  versioned key such as `preferences.example.v1`.
- Deep links only open the routes listed in `lib/deep-links.ts`.

## Testing Guidelines

Jest and `jest-expo` are configured; run `pnpm test` before submitting changes. Put tests in
`__tests__/` as `*.test.ts(x)`. Native modules are mocked in tests, so device behavior (biometrics,
permissions, rating prompts) still needs a check in Expo Go or a local build.

## Commit & Pull Request Guidelines

- Use short, imperative commit messages (for example, "fix paywall plan badge overlap").
- Do not auto-commit changes after completing work. Only create commits when the user explicitly
  asks for a commit.
- PRs should include a clear description, linked issues (if any), and screenshots or screen
  recordings for UI changes. See `CONTRIBUTING.md` for the checks to run.
