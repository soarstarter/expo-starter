# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This repo uses **pnpm** (lockfile is `pnpm-lock.yaml`, `packageManager` pinned in `package.json`).

```bash
pnpm install         # Install dependencies
pnpm dev             # Start Expo dev server (clears cache), press i/a/w for platform
pnpm android         # Start dev server + open Android emulator
pnpm ios             # Start dev server + open iOS simulator (macOS only)
pnpm web             # Start dev server for web browser
pnpm typecheck       # tsc --noEmit
pnpm lint            # expo lint (eslint-config-expo)
pnpm test            # jest
pnpm format          # prettier --write
pnpm format:check    # prettier --check
pnpm check:lite      # boundary check from lite-manifest.json (needs gitleaks, or --skip-secrets)
pnpm clean           # Remove .expo and node_modules (use PowerShell on Windows)
```

Add components from React Native Reusables:

```bash
pnpm dlx @react-native-reusables/cli@latest add [component-names]
```

## Architecture Overview

**Tech Stack:** React Native 0.88 + Expo SDK 58 + TypeScript + Tailwind/Nativewind. No backend: the app makes no network requests.

### Routing (Expo Router)

- File-based routing in `app/`
- Route groups: `(auth)` for login/signup screens, `(tabs)` for main tab interface
- Dynamic routes: `[slug].tsx` pattern
- First-run gates in the root layout: `OnboardingGate`, `ConsentGate`, `BiometricGate` (app lock)

### Core Providers (in root `_layout.tsx`)

- **I18nProvider** (`lib/i18n.tsx`) - i18n-js with `useI18n()` hook, translations in `lib/i18n/`

### Styling

- Tailwind CSS via Nativewind - use `className` prop
- CSS variables in `global.css` for theming (light/dark)
- Theme colors defined in `lib/theme.ts`
- CVA (class-variance-authority) for component variants in `components/ui/`

### UI-only screens

- Sign-in, sign-up, password reset (`app/(auth)/`) and the paywall (`app/paywall.tsx`) render the
  real screens from `components/auth/` and `components/paywall/`, but their submit callbacks only
  show a notice (`lib/ui-demo.ts`). Connect those callbacks to your own backend.
- Keep service calls in the route files; the views only take callbacks.
- Do not add network requests or backend SDKs: `pnpm check:lite` rejects them.

### Showcase

- `lib/showcase/capability-catalog.ts` lists the demos shown in the Showcase tab;
  `lib/showcase/pro-catalog.ts` lists SoarStarter Pro capabilities, each linking to the Pro page.
- `docs/CUSTOMIZE.md` explains how to remove the Showcase and the component gallery.

## Key Patterns

**Path aliases:** `@/*` maps to `*` (e.g., `@/components/ui/button`)

**i18n usage** (add every string to both `lib/i18n/en.json` and `lib/i18n/zh.json`):

```typescript
const { t, locale, setLocale } = useI18n();
<Text>{t('tabs.home')}</Text>
```

**Local storage:**

```typescript
await setCacheJson('preferences.example.v1', { value: true });
const stored = await getCacheJson<{ value: boolean }>('preferences.example.v1');
```

## Code Style

- 2 spaces, 100 char line width, single quotes
- Prettier with `prettier-plugin-tailwindcss` for class sorting
- TypeScript strict mode
- Short imperative commit messages (e.g., "add paywall plan badge")
