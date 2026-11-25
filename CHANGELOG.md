# Changelog

All notable changes to Expo Starter are listed here. See `git log` for the full history.

## 1.0.0 — Unreleased

First open-source release, on Expo SDK 58 and React Native 0.88.

- App shell: Expo Router with four tabs, a drawer menu, and an error boundary. An offline banner
  component is included but not mounted by default.
- First run: onboarding carousel, a versioned terms consent gate, and Terms, Privacy, and EULA
  screens.
- Sign-in, sign-up, email code, forgot and reset password, and paywall screens with form
  validation. They are UI only: submitting shows a notice until the callbacks are connected to a
  backend.
- Theming (light, dark, system) and English and Chinese, switchable at runtime, with a device
  settings section on the Me tab.
- Device capabilities: app lock with biometrics, `expo-starter://` deep links with a route list,
  permission primers, in-app rating, haptics, and invite sharing.
- React Native Reusables components with a component gallery, and a Showcase catalog with a live
  demo for each capability.
- Jest tests and a CI workflow for type checks, lint, tests, formatting, Expo dependency versions,
  and bundle export, plus `pnpm check:lite` (in CI and as a pre-push hook), which rejects backend
  SDKs, network calls, OTA and EAS settings, and secrets.
