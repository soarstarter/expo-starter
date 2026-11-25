# Contributing

Thanks for helping improve Expo Starter.

## How this repository is maintained

Expo Starter is the open-source edition of SoarStarter's Expo template. New features are built in
the commercial edition first and then synced here, so this repository mostly receives those syncs
plus community fixes. Pull requests that are merged here are also ported back, so the two editions
stay in step.

That makes some contributions a better fit than others:

- **Welcome:** bug fixes, documentation fixes, accessibility and platform-compatibility fixes, test
  coverage, and small improvements to existing features.
- **Please open an issue first:** new features, new dependencies or Expo config plugins, new
  permissions, or changes to the folder layout, the deep-link route list, or the sign-in and
  paywall view props. A short discussion avoids work that cannot be merged.
- **Out of scope:** features that need a backend service (working sign-in, payments, cloud sync,
  push notifications, telemetry) or a release pipeline (EAS builds, over-the-air updates). This
  edition is intentionally fully local, and the sign-in and paywall screens stay UI only.

## Development setup

Requires Node.js 22.13 or later (24 LTS recommended) and pnpm 10. To try changes on a device, use
Expo Go, the iOS Simulator (Xcode), or an Android emulator (Android Studio).

```bash
pnpm install
pnpm dev
```

## Before you open a pull request

Run the same checks as CI:

```bash
pnpm check:lite
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm exec expo install --check
```

`pnpm check:lite` keeps this repository free of commercial-edition code and network calls. It
needs [gitleaks](https://github.com/gitleaks/gitleaks) for its secret scan; without it, run
`pnpm check:lite --skip-secrets` locally and let CI run the full check. The same check runs as a
pre-push hook.

For UI changes, check the screen on iOS and Android (Expo Go is fine) in light and dark mode and in
both languages, and include screenshots in the pull request.

## Conventions

- TypeScript in strict mode; Prettier formatting (2 spaces, single quotes, semicolons, 100
  columns, Tailwind classes sorted by `prettier-plugin-tailwindcss`).
- Style with NativeWind `className`. Add UI primitives with the React Native Reusables CLI
  (`pnpm dlx @react-native-reusables/cli@latest add <component>`) into `components/ui/`.
- Every user-facing string goes in both `lib/i18n/en.json` and `lib/i18n/zh.json`; a test fails if
  the two drift apart.
- Screens that only render UI take callbacks through props and keep service calls in the route
  file, like `components/auth/` and `components/paywall/`.
- Put tests in `__tests__/` as `*.test.ts` or `*.test.tsx`.
- Commit messages are short and imperative, for example `fix paywall plan badge overlap`.

By contributing, you agree that your contribution is licensed under the [MIT License](LICENSE).
