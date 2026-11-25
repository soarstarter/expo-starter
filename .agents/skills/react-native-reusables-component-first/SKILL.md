---
name: react-native-reusables-component-first
description: Prioritize existing react-native-reusables UI components before creating custom ones in this Expo Router app. Use when a user asks for a new UI element, page section, or screen component; first list available react-native-reusables components, then install and use an existing component, and only build a new component if no existing option fits.
---

# React Native Reusables Component-First Workflow

Follow this workflow whenever implementing UI in this repository.

## 1) Identify the requested UI need

- Convert the request into a component category (for example: modal/dialog, input, selection, feedback, layout).
- Prefer the closest existing `react-native-reusables` component.

## 2) Check available reusables components

- Read `references/components-catalog.md` to see known components.
- Treat the catalog as a quick reference; the upstream list can change.

## 3) Prefer existing local components first

- Inspect local components in `components/ui/` before adding anything new.
- If the component already exists locally, use it directly.

Example command:

```powershell
Get-ChildItem -Path components/ui -File | Select-Object -ExpandProperty BaseName
```

## 4) Install existing reusables component when missing locally

- If the component exists in the reusables catalog but not in this repo, install it:

```bash
pnpm dlx @react-native-reusables/cli@latest add <component-name>
```

- After installation, integrate it using the project conventions (`components/ui`, Tailwind/Nativewind class usage, and existing patterns).

## 5) Create new component only when needed

- Create a new component only if:
  - no reusables component maps to the request, or
  - the existing component cannot satisfy required behavior or UX.
- Keep the new component style and API consistent with files in `components/ui/`.

## 6) Report decision clearly

- State which path was chosen:
  - reused existing local component,
  - installed existing reusables component, or
  - created a new custom component.
- Include a short reason when creating a custom component.
