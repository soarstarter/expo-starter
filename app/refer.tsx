import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useI18n } from '@/lib/i18n';
import { recordRatingTrigger } from '@/lib/rating';
import { getInviteLink, shareInviteLink } from '@/lib/referrals';
import { IOS_COLORS } from '@/lib/theme';
import { useToast } from '@/lib/toast';
import { router, Stack } from 'expo-router';
import { ChevronLeft, Gift, Share2 } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

export default function ReferScreen() {
  const { t } = useI18n();
  const { showToast } = useToast();

  const handleShare = React.useCallback(async () => {
    try {
      await shareInviteLink();
      await recordRatingTrigger('referral_shared');
    } catch {
      showToast({ message: t('refer.shareError'), variant: 'error' });
    }
  }, [showToast, t]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('refer.title'),
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              className="mr-2"
              accessibilityRole="button"
              accessibilityLabel={t('profile.cancel')}>
              <Icon as={ChevronLeft} size={28} color={IOS_COLORS.tint} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 bg-ios-grouped-bg"
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}>
        <View className="items-center gap-3 py-4">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-ios-indigo">
            <Icon as={Gift} color={IOS_COLORS.white} size={27} />
          </View>
          <Text className="text-center text-[26px] font-semibold text-foreground">
            {t('refer.heading')}
          </Text>
          <Text className="text-center text-[15px] leading-6 text-ios-label-secondary">
            {t('refer.subtitle')}
          </Text>
        </View>

        <View className="rounded-xl bg-ios-grouped-surface p-4">
          <Text selectable className="text-xs text-ios-label-secondary">
            {getInviteLink()}
          </Text>
          <Button className="mt-4" onPress={handleShare}>
            <Icon as={Share2} size={16} color={IOS_COLORS.white} />
            <Text>{t('refer.shareInvite')}</Text>
          </Button>
        </View>
      </ScrollView>
    </>
  );
}
