import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useConsent } from '@/lib/consent';
import { useI18n } from '@/lib/i18n';
import { IOS_COLORS } from '@/lib/theme';
import { router, useSegments, type Href } from 'expo-router';
import { ScrollText } from 'lucide-react-native';
import * as React from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LINKS: { href: Href; labelKey: string }[] = [
  { href: '/legal/terms', labelKey: 'legal.terms.title' },
  { href: '/legal/privacy', labelKey: 'legal.privacy.title' },
  { href: '/legal/eula', labelKey: 'legal.eula.title' },
];

export function ConsentGate() {
  const { t } = useI18n();
  const { hasAcceptedCurrent, isHydrated, accept } = useConsent();
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const [accepting, setAccepting] = React.useState(false);

  if (!isHydrated || hasAcceptedCurrent) return null;
  if (segments[0] === 'legal') return null;

  const handleAccept = async () => {
    setAccepting(true);
    await accept();
    setAccepting(false);
  };

  return (
    <Modal visible animationType="fade" transparent onRequestClose={() => undefined}>
      <View className="flex-1 justify-end bg-black/60">
        <View
          className="rounded-t-3xl bg-ios-grouped-bg px-5 pt-6"
          style={{ paddingBottom: insets.bottom + 20, maxHeight: '85%' }}>
          <View className="mb-4 h-12 w-12 items-center justify-center rounded-2xl bg-ios-tint">
            <Icon as={ScrollText} color={IOS_COLORS.white} size={24} />
          </View>

          <Text className="text-[24px] font-semibold text-foreground">
            {t('legal.consentTitle')}
          </Text>
          <Text className="mt-2 text-[15px] leading-6 text-ios-label-secondary">
            {t('legal.consentSubtitle')}
          </Text>

          <ScrollView
            className="mt-4"
            contentContainerStyle={{ paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}>
            <View className="overflow-hidden rounded-xl bg-ios-grouped-surface">
              {LINKS.map((link, index) => (
                <View key={link.href as string}>
                  <Pressable
                    onPress={() => router.push(link.href)}
                    accessibilityRole="link"
                    accessibilityLabel={t(link.labelKey)}>
                    <View className="flex-row items-center justify-between px-4 py-3">
                      <Text className="text-[17px] text-foreground">{t(link.labelKey)}</Text>
                      <Text className="text-[15px] text-ios-tint">{t('legal.read')}</Text>
                    </View>
                  </Pressable>
                  {index < LINKS.length - 1 ? (
                    <View className="ml-4 h-px bg-ios-separator-soft" />
                  ) : null}
                </View>
              ))}
            </View>
            <Text className="mt-4 px-1 text-[13px] leading-5 text-ios-label-secondary">
              {t('legal.consentDisclaimer')}
            </Text>
          </ScrollView>

          <Button className="mt-5" size="lg" disabled={accepting} onPress={handleAccept}>
            <Text>{accepting ? t('common.loading') : t('legal.accept')}</Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
}
