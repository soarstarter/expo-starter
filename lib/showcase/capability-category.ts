import {
  Box,
  CreditCard,
  KeyRound,
  Settings2,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react-native';

/**
 * Top-level grouping for the template's demonstrated capabilities. These are the
 * section headers in the Showcase catalog (Phase 2) and the grouping used by the
 * Home capability chips (Phase 4). Ported from the iOS `CapabilityCategory`.
 *
 * `titleKey` resolves through `useI18n().t(...)`; `icon` is the Lucide glyph shown
 * as the section header.
 */
export type CapabilityCategory =
  | 'foundation'
  | 'authentication'
  | 'commerce'
  | 'growth'
  | 'operations';

export type CapabilityCategoryMeta = {
  category: CapabilityCategory;
  titleKey: string;
  icon: LucideIcon;
};

/** Catalog categories in display order. */
export const CAPABILITY_CATEGORIES: CapabilityCategoryMeta[] = [
  { category: 'foundation', titleKey: 'capabilityCategory.foundation', icon: Box },
  { category: 'authentication', titleKey: 'capabilityCategory.authentication', icon: KeyRound },
  { category: 'commerce', titleKey: 'capabilityCategory.commerce', icon: CreditCard },
  { category: 'growth', titleKey: 'capabilityCategory.growth', icon: TrendingUp },
  { category: 'operations', titleKey: 'capabilityCategory.operations', icon: Settings2 },
];
