import { type Href } from 'expo-router';
import {
  Hand,
  Link2,
  LockOpen,
  Paintbrush,
  ScanFace,
  Share2,
  Sparkles,
  Star,
  UserCheck,
  Vibrate,
} from 'lucide-react-native';

import { type CapabilityCategory } from './capability-category';
import { type TemplateCapability } from './template-capability';

/**
 * The catalog of every capability the template demonstrates. Single source of truth
 * consumed by the Showcase tab (Phase 2) and the Home capability groups (Phase 4).
 * Adding a capability is a one-line edit here — no view changes.
 *
 * Note: the Component gallery is its own tab, not a catalog row (mirrors iOS), so
 * there is intentionally no `components` capability here.
 */
export const CAPABILITY_CATALOG: TemplateCapability[] = [
  // Foundation
  {
    id: 'theming',
    titleKey: 'showcase.theming.title',
    summaryKey: 'showcase.theming.summary',
    category: 'foundation',
    icon: Paintbrush,
    href: '/showcase/theming' as Href,
    status: 'liveDemo',
  },
  {
    id: 'onboarding',
    titleKey: 'showcase.onboarding.title',
    summaryKey: 'showcase.onboarding.summary',
    category: 'foundation',
    icon: Sparkles,
    href: '/onboarding' as Href,
    status: 'liveDemo',
  },
  {
    id: 'haptics',
    titleKey: 'showcase.haptics.title',
    summaryKey: 'showcase.haptics.summary',
    category: 'foundation',
    icon: Vibrate,
    href: '/showcase/haptics' as Href,
    status: 'liveDemo',
  },

  // Authentication & Account
  {
    id: 'auth-screens',
    titleKey: 'showcase.auth.title',
    summaryKey: 'showcase.auth.summary',
    category: 'authentication',
    icon: UserCheck,
    href: '/login' as Href,
    status: 'uiOnly',
  },
  {
    id: 'biometric-lock',
    titleKey: 'showcase.biometrics.title',
    summaryKey: 'showcase.biometrics.summary',
    category: 'authentication',
    icon: ScanFace,
    href: null,
    status: 'deviceOnly',
  },

  // Commerce
  {
    id: 'paywall',
    titleKey: 'showcase.paywall.title',
    summaryKey: 'showcase.paywall.summary',
    category: 'commerce',
    icon: LockOpen,
    href: '/paywall' as Href,
    status: 'uiOnly',
  },

  // Growth
  {
    id: 'deep-links',
    titleKey: 'showcase.deepLinks.title',
    summaryKey: 'showcase.deepLinks.summary',
    category: 'growth',
    icon: Link2,
    href: '/showcase/deep-links' as Href,
    status: 'liveDemo',
  },
  {
    id: 'referrals',
    titleKey: 'showcase.referrals.title',
    summaryKey: 'showcase.referrals.summary',
    category: 'growth',
    icon: Share2,
    href: '/refer' as Href,
    status: 'liveDemo',
  },
  {
    id: 'app-rating',
    titleKey: 'showcase.rating.title',
    summaryKey: 'showcase.rating.summary',
    category: 'growth',
    icon: Star,
    href: '/showcase/rating' as Href,
    status: 'liveDemo',
  },

  // Operations
  {
    id: 'permissions',
    titleKey: 'showcase.permissions.title',
    summaryKey: 'showcase.permissions.summary',
    category: 'operations',
    icon: Hand,
    href: '/permissions' as Href,
    status: 'liveDemo',
  },
];

/** Capabilities belonging to a category, in catalog order. */
export function capabilitiesIn(category: CapabilityCategory): TemplateCapability[] {
  return CAPABILITY_CATALOG.filter((capability) => capability.category === category);
}

/** The capability whose demo destination is `href`, if any. */
export function capabilityForHref(href: Href | null): TemplateCapability | undefined {
  if (href == null) return undefined;
  return CAPABILITY_CATALOG.find((capability) => capability.href === href);
}
