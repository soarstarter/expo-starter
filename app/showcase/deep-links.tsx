import { router, Stack } from 'expo-router';
import { ArrowUpRight, ChevronLeft, Link2 } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { createAppLink, openDeepLink, resolveDeepLinkHref } from '@/lib/deep-links';
import { useI18n } from '@/lib/i18n';
import { IOS_COLORS } from '@/lib/theme';

type DemoLink = { labelKey: string; path: string };

const LINKS: DemoLink[] = [
  { labelKey: 'tabs.home', path: '/' },
  { labelKey: 'showcase.paywall.title', path: '/paywall' },
  { labelKey: 'showcase.permissions.title', path: '/permissions' },
  { labelKey: 'showcase.referrals.title', path: '/refer' },
];

export default function DeepLinksShowcaseScreen() {
  const { t } = useI18n();
  const [resolved, setResolved] = React.useState<string | null>(null);

  const fire = React.useCallback((path: string) => {
    const url = createAppLink(path);
    const href = resolveDeepLinkHref(url);
    setResolved(href ? String(href) : null);
    openDeepLink(url);
  }, []);

  return (
    <>
      <ShowcaseHeader title={t('showcase.deepLinks.title')} cancelLabel={t('profile.cancel')} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 bg-ios-grouped-bg"
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 24 }}>
        <Text className="text-[15px] leading-6 text-ios-label-secondary">
          {t('showcase.deepLinks.summary')}
        </Text>

        <View className="overflow-hidden rounded-xl bg-ios-grouped-surface">
          {LINKS.map((link, index) => (
            <React.Fragment key={link.path}>
              {index > 0 ? <View className="ml-12 h-px bg-ios-separator" /> : null}
              <Pressable
                onPress={() => fire(link.path)}
                className="flex-row items-center gap-3 px-4 py-3 active:opacity-60">
                <Icon as={Link2} size={18} color={IOS_COLORS.tint} />
                <View className="flex-1">
                  <Text className="text-[15px] font-medium text-foreground">
                    {t(link.labelKey)}
                  </Text>
                  <Text className="font-mono text-[12px] text-ios-label-secondary">
                    {createAppLink(link.path)}
                  </Text>
                </View>
                <Icon as={ArrowUpRight} size={16} color={IOS_COLORS.labelSecondary} />
              </Pressable>
            </React.Fragment>
          ))}
        </View>

        {resolved ? (
          <View className="gap-1 rounded-xl bg-ios-grouped-surface p-4">
            <Text className="text-[13px] text-ios-label-secondary">
              {t('showcase.deepLinks.resolvedLabel')}
            </Text>
            <Text selectable className="font-mono text-[13px] text-foreground">
              {resolved}
            </Text>
          </View>
        ) : null}

        <Text className="text-[13px] leading-5 text-ios-label-secondary">
          {t('showcase.deepLinks.note')}
        </Text>
      </ScrollView>
    </>
  );
}

function ShowcaseHeader({ title, cancelLabel }: { title: string; cancelLabel: string }) {
  return (
    <Stack.Screen
      options={{
        headerShown: true,
        title,
        headerLeft: () => (
          <Pressable
            onPress={() => router.back()}
            className="mr-2"
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}>
            <Icon as={ChevronLeft} size={28} color={IOS_COLORS.tint} />
          </Pressable>
        ),
      }}
    />
  );
}
