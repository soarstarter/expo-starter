import { ThemeToggle } from '@/components/theme-toggle';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useI18n } from '@/lib/i18n';
import { getIOSColor } from '@/lib/theme';
import { Tabs, useRouter, type Href } from 'expo-router';
import {
  GiftIcon,
  HomeIcon,
  LayoutGrid,
  LayoutPanelTop,
  LogInIcon,
  type LucideIcon,
  Menu,
  UserIcon,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';

const HIDDEN_TAB_BUTTON = {
  tabBarButton: () => null,
  tabBarItemStyle: { display: 'none' },
} as const;

type MenuItem = {
  id: string;
  label: string;
  href: Href;
  icon: LucideIcon;
  iconColor?: string;
};

type MenuSection = {
  title?: string;
  items: MenuItem[];
};

export default function TabsLayout() {
  const { t } = useI18n();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const groupedBackground = getIOSColor('groupedBg', isDark ? 'dark' : 'light');
  const [menuOpen, setMenuOpen] = React.useState(false);

  // 暗色模式下提升一档颜色，避免抽屉与背后蒙层（near-black）混在一起
  const drawerColors = {
    backdrop: isDark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.4)',
    panel: isDark ? '#1c1c1e' : '#f2f2f7', // 暗色：grouped-surface 等级；亮色：grouped-bg
    card: isDark ? '#2c2c2e' : '#ffffff', // 暗色：再提一档形成层次
    border: isDark ? '#3a3a3c' : 'rgba(0, 0, 0, 0.06)',
  };

  const menuSections: MenuSection[] = React.useMemo(
    () => [
      {
        title: t('menu.discover'),
        items: [
          { id: 'home', label: t('tabs.home'), href: '/', icon: HomeIcon },
          { id: 'component', label: t('tabs.component'), href: '/component', icon: LayoutPanelTop },
          { id: 'showcase', label: t('tabs.showcase'), href: '/showcase', icon: LayoutGrid },
        ],
      },
      {
        items: [{ id: 'refer', label: t('refer.title'), href: '/refer' as Href, icon: GiftIcon }],
      },
      {
        title: t('menu.account'),
        items: [{ id: 'login', label: t('common.signIn'), href: '/login', icon: LogInIcon }],
      },
    ],
    [t]
  );

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerTitleAlign: 'center',
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: groupedBackground },
          sceneStyle: { backgroundColor: groupedBackground },
          headerLeft: () => (
            <Pressable
              onPress={() => setMenuOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={t('menu.discover')}
              className="ios:size-9 ml-4 items-center justify-center">
              <Icon as={Menu} className="size-5" />
            </Pressable>
          ),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarLabel: t('tabs.home'),
            tabBarIcon: ({ color, size }) => <Icon as={HomeIcon} color={color} size={size} />,
            headerRight: () => <ThemeToggle />,
          }}
        />
        <Tabs.Screen
          name="component"
          options={{
            title: 'Components',
            tabBarLabel: t('tabs.component'),
            tabBarIcon: ({ color, size }) => <Icon as={LayoutPanelTop} color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="showcase"
          options={{
            title: 'Showcase',
            tabBarLabel: t('tabs.showcase'),
            tabBarIcon: ({ color, size }) => <Icon as={LayoutGrid} color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="me"
          options={{
            title: 'Me',
            tabBarLabel: t('tabs.me'),
            tabBarIcon: ({ color, size }) => <Icon as={UserIcon} color={color} size={size} />,
          }}
        />
        {/* Opened from Home with the tab bar still visible. `href: null` would hide the route
            entirely (it could no longer be navigated to), so only its tab button is hidden. */}
        <Tabs.Screen
          name="home-paywall"
          options={{
            ...HIDDEN_TAB_BUTTON,
            title: t('paywall.title'),
          }}
        />
      </Tabs>
      {menuOpen ? (
        <Pressable
          onPress={() => setMenuOpen(false)}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            backgroundColor: drawerColors.backdrop,
          }}>
          <View
            onStartShouldSetResponder={() => true}
            className="h-full w-[300px] pt-14"
            style={{
              paddingHorizontal: 12,
              backgroundColor: drawerColors.panel,
              borderRightWidth: Platform.OS === 'web' ? 1 : 0.5,
              borderRightColor: drawerColors.border,
              ...Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOpacity: isDark ? 0.6 : 0.18,
                  shadowRadius: 16,
                  shadowOffset: { width: 4, height: 0 },
                },
                android: { elevation: 16 },
                default: {},
              }),
            }}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 24, gap: 16 }}>
              {menuSections.map((section, sectionIdx) => (
                <View key={section.title ?? `section-${sectionIdx}`} className="gap-2">
                  {section.title ? (
                    <Text className="px-3 text-xs font-semibold uppercase tracking-wider text-ios-label-secondary">
                      {section.title}
                    </Text>
                  ) : null}
                  <View
                    className="overflow-hidden rounded-2xl"
                    style={{ backgroundColor: drawerColors.card }}>
                    {section.items.map((item) => (
                      <Pressable
                        key={item.id}
                        onPress={() => {
                          setMenuOpen(false);
                          router.push(item.href);
                        }}
                        accessibilityRole="link"
                        accessibilityLabel={item.label}
                        android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
                        className="flex-row items-center gap-3 px-4 py-3.5 active:bg-ios-fill-pressed">
                        <Icon
                          as={item.icon}
                          className="size-5 text-foreground"
                          color={item.iconColor}
                        />
                        <Text className="flex-1 text-base text-foreground">{item.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}

              <View className="mt-2 flex-row items-center justify-around px-2">
                <View className="items-center gap-1">
                  <ThemeToggle />
                  <Text className="text-xs text-ios-label-secondary">{t('common.theme')}</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}
