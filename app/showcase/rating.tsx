import { router, Stack } from 'expo-router';
import { CheckCircle2, ChevronLeft, Star } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useI18n } from '@/lib/i18n';
import { requestReviewNow } from '@/lib/rating';
import { IOS_COLORS } from '@/lib/theme';
import { useToast } from '@/lib/toast';

const RULE_KEYS = ['showcase.rating.rule1', 'showcase.rating.rule2', 'showcase.rating.rule3'];

export default function RatingShowcaseScreen() {
  const { t } = useI18n();
  const { showToast } = useToast();

  const requestReview = React.useCallback(async () => {
    const requested = await requestReviewNow();
    showToast({
      message: requested ? t('showcase.rating.requested') : t('showcase.rating.unavailable'),
      variant: requested ? 'info' : 'error',
    });
  }, [showToast, t]);

  return (
    <>
      <ShowcaseHeader title={t('showcase.rating.title')} cancelLabel={t('profile.cancel')} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 bg-ios-grouped-bg"
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 24 }}>
        <Text className="text-[15px] leading-6 text-ios-label-secondary">
          {t('showcase.rating.summary')}
        </Text>

        <View className="gap-3">
          <Text className="text-xs font-medium uppercase tracking-wide text-ios-label-secondary">
            {t('showcase.rating.rulesTitle')}
          </Text>
          <View className="gap-3 rounded-xl bg-ios-grouped-surface p-4">
            {RULE_KEYS.map((key) => (
              <View key={key} className="flex-row items-start gap-2.5">
                <Icon as={CheckCircle2} size={18} color={IOS_COLORS.green} />
                <Text className="flex-1 text-[15px] leading-6 text-foreground">{t(key)}</Text>
              </View>
            ))}
          </View>
        </View>

        <Button onPress={requestReview}>
          <Icon as={Star} size={16} color={IOS_COLORS.white} />
          <Text>{t('showcase.rating.requestNow')}</Text>
        </Button>

        <Text className="text-[13px] leading-5 text-ios-label-secondary">
          {t('showcase.rating.note')}
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
