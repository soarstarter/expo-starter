import {
  CloudOff,
  Container,
  Contrast,
  Keyboard,
  Layers,
  type LucideIcon,
  Megaphone,
  MessageCircleWarning,
  MessageSquareWarning,
  MousePointerClick,
  PanelBottom,
  RectangleHorizontal,
  Rows3,
  SeparatorHorizontal,
  SlidersHorizontal,
  TextCursorInput,
} from 'lucide-react-native';

/**
 * The catalog backing the Component tab: one entry per reusable `components/ui`
 * component, grouped into sections. The gallery list renders straight from this,
 * and each entry's `slug` names the demo screen it pushes (`/component/<slug>`).
 *
 * English-only by design — copy lives here as plain strings, not in `lib/i18n`
 * (mirrors the iOS `ComponentCatalog`).
 */
export type ComponentGroup = 'controls' | 'inputs' | 'containers' | 'feedback';

export type ComponentEntry = {
  /** Stable slug; also the `/component/<slug>` route and the entry's identity. */
  slug: string;
  title: string;
  summary: string;
  icon: LucideIcon;
  group: ComponentGroup;
};

export type ComponentGroupMeta = {
  group: ComponentGroup;
  title: string;
  icon: LucideIcon;
};

/** Section grouping for the gallery list, in display order. */
export const COMPONENT_GROUPS: ComponentGroupMeta[] = [
  { group: 'controls', title: 'Controls', icon: SlidersHorizontal },
  { group: 'inputs', title: 'Inputs', icon: Keyboard },
  { group: 'containers', title: 'Containers', icon: Container },
  { group: 'feedback', title: 'Feedback', icon: MessageCircleWarning },
];

export const COMPONENT_CATALOG: ComponentEntry[] = [
  // Controls
  {
    slug: 'buttons',
    title: 'Buttons',
    summary:
      'Default, secondary, outline, destructive, and link variants — plus loading and disabled.',
    icon: MousePointerClick,
    group: 'controls',
  },
  {
    slug: 'theme-toggle',
    title: 'Theme toggle',
    summary: 'Button that flips the whole app between light and dark instantly.',
    icon: Contrast,
    group: 'controls',
  },

  // Inputs
  {
    slug: 'text-fields',
    title: 'Text fields',
    summary: 'Labeled inputs with secure entry, disabled, and inline error states.',
    icon: TextCursorInput,
    group: 'inputs',
  },

  // Containers
  {
    slug: 'cards',
    title: 'Cards',
    summary: 'Raised surface that groups related content, with header, body, and footer slots.',
    icon: RectangleHorizontal,
    group: 'containers',
  },
  {
    slug: 'separator',
    title: 'Separator',
    summary: 'Hairline divider for splitting rows and sections, horizontal or vertical.',
    icon: SeparatorHorizontal,
    group: 'containers',
  },
  {
    slug: 'skeleton',
    title: 'Skeleton',
    summary: 'Pulsing placeholder blocks shown in place of content while it loads.',
    icon: Rows3,
    group: 'containers',
  },

  // Feedback
  {
    slug: 'states',
    title: 'UI states',
    summary: 'Loading, empty, error, and data placeholders for screen-level state.',
    icon: Layers,
    group: 'feedback',
  },
  {
    slug: 'offline-banner',
    title: 'Offline banner',
    summary: 'Slim banner that drops in when the device loses connectivity.',
    icon: CloudOff,
    group: 'feedback',
  },
  {
    slug: 'toast',
    title: 'Toasts',
    summary: 'Transient success, error, and info messages with haptics.',
    icon: Megaphone,
    group: 'feedback',
  },
  {
    slug: 'dialog',
    title: 'Dialog',
    summary: 'Modal alert with a title, description, and confirm / cancel actions.',
    icon: MessageSquareWarning,
    group: 'feedback',
  },
  {
    slug: 'sheet',
    title: 'Bottom sheet',
    summary: 'Swipe-dismissable panel that slides up from the bottom edge.',
    icon: PanelBottom,
    group: 'feedback',
  },
];

/** Entries belonging to a group, in catalog order. */
export function componentsIn(group: ComponentGroup): ComponentEntry[] {
  return COMPONENT_CATALOG.filter((entry) => entry.group === group);
}

/** The entry whose demo is `slug`, if any (used for the detail-screen title). */
export function componentForSlug(slug: string): ComponentEntry | undefined {
  return COMPONENT_CATALOG.find((entry) => entry.slug === slug);
}
