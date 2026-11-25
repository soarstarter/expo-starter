import { IOS_COLORS } from '@/lib/theme';

/**
 * Badge describing how runnable a capability is in the current build. Surfaced as
 * a pill on Showcase catalog rows (Phase 2). Ported from the iOS `CapabilityStatus`.
 *
 * - `liveDemo`: fully interactive in the simulator with no extra setup.
 * - `deviceOnly`: needs a real device (some biometrics).
 * - `uiOnly`: the screens and form validation are real; submitting only shows a notice until
 *   the callbacks are connected to a backend.
 */
export type CapabilityStatus = 'liveDemo' | 'deviceOnly' | 'uiOnly';

type CapabilityStatusMeta = {
  labelKey: string;
  /** Solid tint, resolved from `IOS_COLORS`. Mirrors the iOS status colors. */
  tint: string;
};

const CAPABILITY_STATUS_META: Record<CapabilityStatus, CapabilityStatusMeta> = {
  liveDemo: { labelKey: 'capabilityStatus.liveDemo', tint: IOS_COLORS.green },
  deviceOnly: { labelKey: 'capabilityStatus.deviceOnly', tint: IOS_COLORS.orange },
  uiOnly: { labelKey: 'capabilityStatus.uiOnly', tint: IOS_COLORS.indigo },
};

export function statusLabelKey(status: CapabilityStatus): string {
  return CAPABILITY_STATUS_META[status].labelKey;
}

export function statusTint(status: CapabilityStatus): string {
  return CAPABILITY_STATUS_META[status].tint;
}
