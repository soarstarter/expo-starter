# Screenshots

The root README shows `overview.png`, a row of five iPhone screenshots: `onboarding.png`,
`login.png`, `paywall.png`, `home.png`, and `showcase.png`. The social preview in
`docs/social-preview/` uses `login.png`, `paywall.png`, and `showcase.png`. They show the stock
template; recapture them from your rebranded app so the assets match your product.

## What to capture

| File             | Screen          | How to get there                              |
| ---------------- | --------------- | --------------------------------------------- |
| `onboarding.png` | Onboarding      | First launch, after accepting the terms       |
| `login.png`      | Sign-in         | Drawer → Sign in, or the Sign-in screens demo |
| `paywall.png`    | Paywall (modal) | Me → Upgrade to Pro                           |
| `home.png`       | Home tab        | Home                                          |
| `showcase.png`   | Showcase tab    | Showcase                                      |

## Capturing on the iOS Simulator

With the app open in Expo Go, hide the Expo Go tools button (open the developer menu with
`Cmd+D` and turn off **Tools button**) and set a clean status bar:

```sh
xcrun simctl status_bar booted override --time 9:41 --batteryState charged --batteryLevel 100
xcrun simctl io booted screenshot docs/screenshots/home.png
xcrun simctl status_bar booted clear
```

The README images are scaled to 603 px wide. `overview.png` places the five screenshots side by
side at 300 px each with a 12 px gap.
