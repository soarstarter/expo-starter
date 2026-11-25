import { router, Stack } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { haptics } from '@/lib/haptics';
import { useI18n } from '@/lib/i18n';
import { IOS_COLORS } from '@/lib/theme';
import { useToast } from '@/lib/toast';

type Generator = { labelKey: string; run: () => void };

const SECTIONS: { titleKey: string; buttons: Generator[] }[] = [
  {
    titleKey: 'showcase.haptics.impactSection',
    buttons: [
      { labelKey: 'showcase.haptics.light', run: haptics.light },
      { labelKey: 'showcase.haptics.medium', run: haptics.medium },
      { labelKey: 'showcase.haptics.heavy', run: haptics.heavy },
    ],
  },
  {
    titleKey: 'showcase.haptics.notificationSection',
    buttons: [
      { labelKey: 'showcase.haptics.success', run: haptics.success },
      { labelKey: 'showcase.haptics.warning', run: haptics.warning },
      { labelKey: 'showcase.haptics.error', run: haptics.error },
    ],
  },
  {
    titleKey: 'showcase.haptics.selectionSection',
    buttons: [{ labelKey: 'showcase.haptics.selectionButton', run: haptics.selection }],
  },
];

export default function HapticsShowcaseScreen() {
  const { t } = useI18n();
  const { showToast } = useToast();

  const fire = React.useCallback(
    (generator: Generator) => {
      generator.run();
      showToast({ message: t('showcase.haptics.fired'), variant: 'info' });
    },
    [showToast, t]
  );

  return (
    <>
      <ShowcaseHeader title={t('showcase.haptics.title')} cancelLabel={t('profile.cancel')} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 bg-ios-grouped-bg"
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 24 }}>
        <Text className="text-[15px] leading-6 text-ios-label-secondary">
          {t('showcase.haptics.summary')}
        </Text>

        {SECTIONS.map((section) => (
          <View key={section.titleKey} className="gap-3">
            <Text className="text-xs font-medium uppercase tracking-wide text-ios-label-secondary">
              {t(section.titleKey)}
            </Text>
            <View className="gap-3">
              {section.buttons.map((generator) => (
                <Button
                  key={generator.labelKey}
                  variant="secondary"
                  onPress={() => fire(generator)}>
                  <Text>{t(generator.labelKey)}</Text>
                </Button>
              ))}
            </View>
          </View>
        ))}

        <Text className="text-[13px] leading-5 text-ios-label-secondary">
          {t('showcase.haptics.note')}
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
