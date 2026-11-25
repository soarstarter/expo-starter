import { type Href } from 'expo-router';
import { type LucideIcon } from 'lucide-react-native';

import { type CapabilityCategory } from './capability-category';
import { type CapabilityStatus } from './capability-status';

/**
 * One demonstrated capability of the template — the single source of truth for the
 * Showcase catalog rows (Phase 2) and the Home capability groups (Phase 4). A
 * capability is described in exactly one place; every surface renders from this model.
 */
export type TemplateCapability = {
  /** Stable slug, e.g. `'deep-links'`. Unique across the catalog. */
  id: string;
  /** Row title, resolved through `useI18n().t(...)`. */
  titleKey: string;
  /** One-line summary of what the capability demonstrates. */
  summaryKey: string;
  /** Catalog group this capability belongs to. */
  category: CapabilityCategory;
  /** Lucide glyph shown as the row icon. */
  icon: LucideIcon;
  /** Demo destination pushed from the row, or `null` for an informational row. */
  href: Href | null;
  /** How runnable the capability is in the current build. */
  status: CapabilityStatus;
};
