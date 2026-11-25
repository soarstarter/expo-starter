import {
  Bell,
  Bug,
  ChartNoAxesColumn,
  CreditCard,
  ListTodo,
  LockKeyhole,
  LogIn,
  Mail,
  Network,
  RefreshCw,
  Rocket,
  Ticket,
  Upload,
  UserCog,
  type LucideIcon,
} from 'lucide-react-native';

/**
 * Capabilities that ship in SoarStarter Pro rather than this open-source starter. They are
 * listed in the Showcase for discovery only: each row opens the Pro page in the system browser.
 * Nothing here is implemented in this repository.
 *
 * This file and the `pro.*` locale keys are the only places that describe Pro modules by name.
 * Delete this file and the Pro section in `app/(tabs)/showcase.tsx` to remove the listing.
 */
export const PRO_UPGRADE_URL =
  'https://soarstarter.com/expo?utm_source=github&utm_campaign=expo-lite';

export type ProCapability = {
  id: string;
  titleKey: string;
  summaryKey: string;
  icon: LucideIcon;
};

const pro = (id: string, icon: LucideIcon): ProCapability => ({
  id,
  titleKey: `pro.items.${id}.title`,
  summaryKey: `pro.items.${id}.summary`,
  icon,
});

export const PRO_CATALOG: readonly ProCapability[] = [
  pro('email-auth', Mail),
  pro('social-sign-in', LogIn),
  pro('account', UserCog),
  pro('synced-data', ListTodo),
  pro('file-uploads', Upload),
  pro('in-app-purchases', CreditCard),
  pro('feature-gates', LockKeyhole),
  pro('subscription-management', Ticket),
  pro('push-notifications', Bell),
  pro('unified-backend', Network),
  pro('update-gate', RefreshCw),
  pro('release-pipeline', Rocket),
  pro('error-reporting', Bug),
  pro('analytics', ChartNoAxesColumn),
];
