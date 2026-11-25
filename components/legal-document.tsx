import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useI18n } from '@/lib/i18n';
import { LEGAL_DOCS, LEGAL_URLS, LEGAL_VERSION, type LegalDocId } from '@/lib/legal';
import { IOS_COLORS } from '@/lib/theme';
import { router, Stack } from 'expo-router';
import { ChevronLeft, ExternalLink } from 'lucide-react-native';
import * as React from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';

export function LegalDocumentScreen({ docId }: { docId: LegalDocId }) {
  const { t } = useI18n();
  const doc = LEGAL_DOCS[docId];
  const externalUrl = LEGAL_URLS[docId];

  const openExternal = React.useCallback(() => {
    if (externalUrl) {
      Linking.openURL(externalUrl).catch(() => undefined);
    }
  }, [externalUrl]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t(doc.titleKey),
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
        contentContainerStyle={{ padding: 20, paddingBottom: 48, gap: 20 }}>
        <View className="gap-2">
          <Text className="text-[28px] font-semibold text-foreground">{t(doc.titleKey)}</Text>
          <Text className="text-[13px] text-ios-label-secondary">
            {t('legal.lastUpdated', { version: LEGAL_VERSION })}
          </Text>
          <Text className="mt-2 text-[15px] leading-6 text-foreground">{t(doc.introKey)}</Text>
        </View>

        {doc.sectionKeys.map((section) => (
          <View key={section.titleKey} className="gap-2">
            <Text className="text-[17px] font-semibold text-foreground">{t(section.titleKey)}</Text>
            <Text className="text-[15px] leading-6 text-ios-label-secondary">
              {t(section.bodyKey)}
            </Text>
          </View>
        ))}

        {externalUrl ? (
          <Pressable
            onPress={openExternal}
            accessibilityRole="link"
            accessibilityLabel={t('legal.viewOnline')}
            className="mt-2 flex-row items-center justify-center gap-2 rounded-xl bg-ios-grouped-surface px-4 py-3">
            <Text className="text-[15px] font-semibold text-ios-tint">{t('legal.viewOnline')}</Text>
            <Icon as={ExternalLink} size={16} color={IOS_COLORS.tint} />
          </Pressable>
        ) : null}
      </ScrollView>
    </>
  );
}
