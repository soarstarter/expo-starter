import { DeviceSettingsSection } from '@/components/settings/device-settings-section';
import { SettingsRow, SettingsSection } from '@/components/settings/settings-list';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useI18n } from '@/lib/i18n';
import { getIOSColor, IOS_COLORS } from '@/lib/theme';
import { router } from 'expo-router';
import { ChevronRight, CircleStar, User } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MeScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';

  const pressedColor = getIOSColor('fillPressed', scheme);
  const chevronColor = getIOSColor('labelTertiary', scheme);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-ios-grouped-bg"
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: insets.bottom + 28,
      }}>
      <View className="flex-1 px-4 pt-3">
        {/* Profile Card */}
        <View className="overflow-hidden rounded-2xl bg-ios-grouped-surface">
          <Pressable
            onPress={() => router.push('/login')}
            accessibilityRole="link"
            accessibilityLabel={t('common.signIn')}
            style={({ pressed }) => ({
              backgroundColor: pressed ? pressedColor : 'transparent',
            })}>
            <View className="flex-row items-center px-4 py-4">
              <View className="mr-3.5 size-16 items-center justify-center rounded-full bg-ios-tint">
                <Icon as={User} size={30} color={IOS_COLORS.white} />
              </View>
              <View className="min-w-0 flex-1">
                <Text numberOfLines={1} className="text-[22px] font-semibold text-foreground">
                  {t('common.signIn')}
                </Text>
                <Text numberOfLines={2} className="mt-0.5 text-[14px] text-ios-label-secondary">
                  {t('profile.bioGuest')}
                </Text>
              </View>
              <Icon
                as={ChevronRight}
                size={14}
                color={chevronColor}
                strokeWidth={2.5}
                absoluteStrokeWidth
              />
            </View>
          </Pressable>
        </View>

        <SettingsSection title={t('subscription.sectionTitle')}>
          <SettingsRow
            icon={CircleStar}
            iconColor={IOS_COLORS.tint}
            title={t('subscription.upgrade')}
            onPress={() => router.push('/paywall')}
          />
        </SettingsSection>

        <DeviceSettingsSection />
      </View>
    </ScrollView>
  );
}
