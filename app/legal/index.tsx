import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useConsent } from '@/lib/consent';
import { useI18n } from '@/lib/i18n';
import { getIOSColor, IOS_COLORS } from '@/lib/theme';
import { router, Stack, type Href } from 'expo-router';
import { ChevronLeft, ChevronRight, FileText, ScrollText, ShieldCheck } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Pressable, ScrollView, View } from 'react-native';

const ROWS: {
  href: Href;
  titleKey: string;
  icon: typeof FileText;
  iconBg: string;
}[] = [
  { href: '/legal/terms', titleKey: 'legal.terms.title', icon: ScrollText, iconBg: 'bg-ios-tint' },
  {
    href: '/legal/privacy',
    titleKey: 'legal.privacy.title',
    icon: ShieldCheck,
    iconBg: 'bg-ios-green',
  },
  { href: '/legal/eula', titleKey: 'legal.eula.title', icon: FileText, iconBg: 'bg-ios-indigo' },
];

export default function LegalIndexScreen() {
  const { t } = useI18n();
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const { acceptedVersion } = useConsent();
  const pressedColor = getIOSColor('fillPressed', scheme);
  const chevronColor = getIOSColor('labelTertiary', scheme);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('legal.title'),
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              className="mr-2"
              accessibilityRole="button"
              accessibilityLabel={t('common.done')}>
              <Icon as={ChevronLeft} size={28} color={IOS_COLORS.tint} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 bg-ios-grouped-bg"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text className="mb-2 ml-2 text-[13px] text-ios-label-secondary">
          {t('legal.subtitle')}
        </Text>

        <View className="overflow-hidden rounded-xl bg-ios-grouped-surface">
          {ROWS.map((row, index) => (
            <View key={row.href as string}>
              <Pressable
                onPress={() => router.push(row.href)}
                accessibilityRole="link"
                accessibilityLabel={t(row.titleKey)}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? pressedColor : 'transparent',
                })}>
                <View className="flex-row items-center px-3.5 py-3">
                  <View
                    className={`h-6.5 w-6.5 mr-3 items-center justify-center rounded-md ${row.iconBg}`}>
                    <Icon as={row.icon} size={16} color={IOS_COLORS.white} />
                  </View>
                  <Text className="flex-1 text-[17px] text-foreground">{t(row.titleKey)}</Text>
                  <Icon as={ChevronRight} size={20} color={chevronColor} />
                </View>
              </Pressable>
              {index < ROWS.length - 1 ? (
                <View className="ml-[52px] h-px bg-ios-separator-soft" />
              ) : null}
            </View>
          ))}
        </View>

        {acceptedVersion ? (
          <Text className="ml-2 mt-4 text-[13px] text-ios-label-secondary">
            {t('legal.acceptedOn', { version: acceptedVersion })}
          </Text>
        ) : null}
      </ScrollView>
    </>
  );
}
