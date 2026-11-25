import { router, Stack } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ThemeToggle } from '@/components/theme-toggle';
import { useI18n, type SupportedLocale } from '@/lib/i18n';
import { IOS_COLORS } from '@/lib/theme';

const LANGUAGES: { code: SupportedLocale; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
];

const SWATCHES = [IOS_COLORS.tint, IOS_COLORS.green, IOS_COLORS.orange, IOS_COLORS.indigo];

export default function ThemingShowcaseScreen() {
  const { t, locale, setLocale } = useI18n();
  const { colorScheme } = useColorScheme();

  return (
    <>
      <ShowcaseHeader title={t('showcase.theming.title')} cancelLabel={t('profile.cancel')} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 bg-ios-grouped-bg"
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 24 }}>
        <Text className="text-[15px] leading-6 text-ios-label-secondary">
          {t('showcase.theming.summary')}
        </Text>

        <Section title={t('showcase.theme.appearanceTitle')}>
          <View className="flex-row items-center justify-between rounded-xl bg-ios-grouped-surface p-4">
            <Text className="text-[15px] text-foreground">
              {colorScheme === 'dark' ? t('showcase.theme.dark') : t('showcase.theme.light')}
            </Text>
            <ThemeToggle />
          </View>
        </Section>

        <Section title={t('showcase.theme.languageTitle')}>
          <View className="flex-row gap-3">
            {LANGUAGES.map((language) => (
              <Button
                key={language.code}
                variant={locale === language.code ? 'default' : 'outline'}
                className="flex-1"
                onPress={() => setLocale(language.code)}>
                <Text>{language.label}</Text>
              </Button>
            ))}
          </View>
        </Section>

        <Section title={t('showcase.theme.previewTitle')}>
          <View className="gap-4 rounded-xl bg-ios-grouped-surface p-4">
            <Text className="text-[15px] leading-6 text-foreground">
              {t('showcase.theme.sampleBody')}
            </Text>
            <View className="flex-row gap-2.5">
              {SWATCHES.map((color) => (
                <View
                  key={color}
                  className="h-9 flex-1 rounded-[10px]"
                  style={{ backgroundColor: color }}
                />
              ))}
            </View>
            <Button>
              <Text>{t('common.done')}</Text>
            </Button>
          </View>
        </Section>
      </ScrollView>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-xs font-medium uppercase tracking-wide text-ios-label-secondary">
        {title}
      </Text>
      {children}
    </View>
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
