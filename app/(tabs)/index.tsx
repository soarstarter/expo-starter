import { router, type Href } from 'expo-router';
import {
  Box,
  ChevronRight,
  CreditCard,
  KeyRound,
  LayoutPanelTop,
  LockOpen,
  Settings2,
  TrendingUp,
  UserCheck,
  type LucideIcon,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Pressable, ScrollView, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useI18n } from '@/lib/i18n';
import { getIOSColor, IOS_COLORS } from '@/lib/theme';

/**
 * Brand / technical terms — intentionally not localized. Mirrors the stack documented in
 * CLAUDE.md.
 */
const STACK_BADGES: string[] = [
  'React Native',
  'Expo',
  'Expo Router',
  'Nativewind',
  'TypeScript',
  'i18n EN/中文',
  'Theming',
];

/**
 * Home-local copy of the `CapabilityCategory` taxonomy (titles + icons) so Home
 * doesn't hard-depend on the removable showcase catalog. Every tile funnels into
 * the Showcase tab.
 */
const HOME_CATEGORIES: { titleKey: string; icon: LucideIcon }[] = [
  { titleKey: 'capabilityCategory.foundation', icon: Box },
  { titleKey: 'capabilityCategory.authentication', icon: KeyRound },
  { titleKey: 'capabilityCategory.commerce', icon: CreditCard },
  { titleKey: 'capabilityCategory.growth', icon: TrendingUp },
  { titleKey: 'capabilityCategory.operations', icon: Settings2 },
];

type DemoAction = {
  key: string;
  href: Href;
  icon: LucideIcon;
  uiOnly?: boolean;
};

/** Runnable previews of the template's features. Sign-in and the paywall are UI only. */
const DEMO_ACTIONS: DemoAction[] = [
  { key: 'components', href: '/component', icon: LayoutPanelTop },
  { key: 'signIn', href: '/login', icon: UserCheck, uiOnly: true },
  { key: 'paywall', href: '/home-paywall' as Href, icon: LockOpen, uiOnly: true },
];

export default function HomeScreen() {
  const { t } = useI18n();
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';

  const pressedColor = getIOSColor('fillPressed', scheme);
  const separatorColor = getIOSColor('separatorSoft', scheme);
  const tint = IOS_COLORS.tint;

  const openShowcase = () => router.push('/showcase');

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 bg-ios-grouped-bg"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 24,
        gap: 20,
      }}>
      {/* Hero */}
      <View
        className="gap-4 rounded-3xl p-5"
        style={{ backgroundColor: `${tint}1A`, borderWidth: 0.5, borderColor: `${tint}2E` }}>
        <View className="gap-2">
          <Text className="text-[34px] font-bold leading-[41px] text-foreground">
            {t('home.hero.title')}
          </Text>
          <Text className="text-[14px] leading-5 text-ios-label-secondary">
            {t('home.hero.subtitle')}
          </Text>
        </View>
        <View className="flex-row flex-wrap gap-2">
          {STACK_BADGES.map((label) => (
            <View
              key={label}
              className="rounded-full px-2.5 py-1.5"
              style={{ backgroundColor: `${tint}1F` }}>
              <Text className="text-[12px] font-semibold" style={{ color: tint }}>
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* What's inside */}
      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-[17px] font-semibold text-foreground">{t('home.whatsInside')}</Text>
          <Pressable
            onPress={openShowcase}
            accessibilityRole="link"
            accessibilityLabel={t('home.seeAll')}
            className="flex-row items-center active:opacity-60">
            <Text className="text-[15px] font-semibold" style={{ color: tint }}>
              {t('home.seeAll')}
            </Text>
            <Icon as={ChevronRight} size={15} color={tint} />
          </Pressable>
        </View>
        <View className="flex-row flex-wrap gap-3">
          {HOME_CATEGORIES.map(({ titleKey, icon }) => (
            <CategoryCard
              key={titleKey}
              title={t(titleKey)}
              icon={icon}
              onPress={openShowcase}
              pressedColor={pressedColor}
              surfaceColor={getIOSColor('groupedSurface', scheme)}
              separatorColor={separatorColor}
            />
          ))}
        </View>
      </View>

      {/* Demos */}
      <View className="gap-3">
        <Text className="text-[17px] font-semibold text-foreground">{t('home.demos.title')}</Text>
        <View className="flex-row flex-wrap gap-3">
          {DEMO_ACTIONS.map((action) => (
            <DemoCard
              key={action.key}
              title={t(`home.action.${action.key}.title`)}
              subtitle={t(`home.action.${action.key}.subtitle`)}
              icon={action.icon}
              tag={action.uiOnly ? t('capabilityStatus.uiOnly') : undefined}
              onPress={() => router.push(action.href)}
              pressedColor={pressedColor}
              surfaceColor={getIOSColor('groupedSurface', scheme)}
              separatorColor={separatorColor}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function CategoryCard({
  title,
  icon,
  onPress,
  pressedColor,
  surfaceColor,
  separatorColor,
}: {
  title: string;
  icon: LucideIcon;
  onPress: () => void;
  pressedColor: string;
  surfaceColor: string;
  separatorColor: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={title}
      className="min-w-[46%] flex-1">
      {({ pressed }) => (
        <Card
          className="flex-row items-center gap-2.5 rounded-[14px] border-[0.5px] px-3.5 py-3.5 shadow-none"
          style={{
            backgroundColor: pressed ? pressedColor : surfaceColor,
            borderColor: separatorColor,
          }}>
          <View className="w-[22px] items-center">
            <Icon as={icon} size={15} color={IOS_COLORS.tint} strokeWidth={2.25} />
          </View>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            className="flex-1 text-[15px] font-medium text-foreground">
            {title}
          </Text>
        </Card>
      )}
    </Pressable>
  );
}

function DemoCard({
  title,
  subtitle,
  icon,
  tag,
  onPress,
  pressedColor,
  surfaceColor,
  separatorColor,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  tag?: string;
  onPress: () => void;
  pressedColor: string;
  surfaceColor: string;
  separatorColor: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={title}
      className="min-w-[46%] flex-1">
      {({ pressed }) => (
        <Card
          className="gap-2 rounded-2xl border-[0.5px] p-4 shadow-none"
          style={{
            backgroundColor: pressed ? pressedColor : surfaceColor,
            borderColor: separatorColor,
          }}>
          <View className="flex-row items-start justify-between">
            <Icon as={icon} size={18} color={IOS_COLORS.tint} strokeWidth={2.25} />
            {tag ? (
              <View
                className="rounded-full px-[7px] py-[3px]"
                style={{ backgroundColor: `${IOS_COLORS.tint}24` }}>
                <Text
                  className="text-[10px] font-bold uppercase tracking-wide"
                  style={{ color: IOS_COLORS.tint }}>
                  {tag}
                </Text>
              </View>
            ) : null}
          </View>
          <Text className="text-[15px] font-semibold text-foreground">{title}</Text>
          <Text className="text-[12px] leading-4 text-ios-label-secondary">{subtitle}</Text>
        </Card>
      )}
    </Pressable>
  );
}
