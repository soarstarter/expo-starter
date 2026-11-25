import { router, type Href } from 'expo-router';
import { ArrowUpRight, ChevronRight } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useI18n } from '@/lib/i18n';
import { CAPABILITY_CATEGORIES } from '@/lib/showcase/capability-category';
import { capabilitiesIn } from '@/lib/showcase/capability-catalog';
import { statusLabelKey, statusTint } from '@/lib/showcase/capability-status';
import { PRO_CATALOG, PRO_UPGRADE_URL, type ProCapability } from '@/lib/showcase/pro-catalog';
import { type TemplateCapability } from '@/lib/showcase/template-capability';
import { getIOSColor, IOS_COLORS } from '@/lib/theme';

export default function ShowcaseScreen() {
  const { t } = useI18n();
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';

  const pressedColor = getIOSColor('fillPressed', scheme);
  const chevronColor = getIOSColor('labelTertiary', scheme);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 bg-ios-grouped-bg"
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {CAPABILITY_CATEGORIES.map(({ category, titleKey, icon }) => {
        const capabilities = capabilitiesIn(category);
        if (capabilities.length === 0) return null;

        return (
          <View key={category} className="mb-8">
            <View className="mb-2 ml-1 flex-row items-center gap-2">
              <Icon as={icon} size={15} color={IOS_COLORS.labelSecondary} />
              <Text className="text-xs uppercase tracking-wide text-ios-label-secondary">
                {t(titleKey)}
              </Text>
            </View>
            <View className="overflow-hidden rounded-xl bg-ios-grouped-surface">
              {capabilities.map((capability, index) => (
                <React.Fragment key={capability.id}>
                  {index > 0 ? <View className="ml-[52px] h-px bg-ios-separator-soft" /> : null}
                  <CapabilityRow
                    capability={capability}
                    pressedColor={pressedColor}
                    chevronColor={chevronColor}
                  />
                </React.Fragment>
              ))}
            </View>
          </View>
        );
      })}

      <ProSection pressedColor={pressedColor} chevronColor={chevronColor} />
    </ScrollView>
  );
}

/** Capabilities that ship in SoarStarter Pro. Each row opens the Pro page in the browser. */
function ProSection({
  pressedColor,
  chevronColor,
}: {
  pressedColor: string;
  chevronColor: string;
}) {
  const { t } = useI18n();

  return (
    <View className="mb-8">
      <Text className="mb-1 ml-1 text-xs uppercase tracking-wide text-ios-label-secondary">
        {t('pro.title')}
      </Text>
      <Text className="mb-2 ml-1 text-[13px] leading-5 text-ios-label-secondary">
        {t('pro.description')}
      </Text>
      <View className="overflow-hidden rounded-xl bg-ios-grouped-surface">
        {PRO_CATALOG.map((capability, index) => (
          <React.Fragment key={capability.id}>
            {index > 0 ? <View className="ml-[52px] h-px bg-ios-separator-soft" /> : null}
            <ProRow
              capability={capability}
              pressedColor={pressedColor}
              chevronColor={chevronColor}
            />
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

function ProRow({
  capability,
  pressedColor,
  chevronColor,
}: {
  capability: ProCapability;
  pressedColor: string;
  chevronColor: string;
}) {
  const { t } = useI18n();

  return (
    <Pressable
      onPress={() => void Linking.openURL(PRO_UPGRADE_URL).catch(() => undefined)}
      accessibilityRole="link"
      accessibilityLabel={`${t(capability.titleKey)}, ${t('pro.action')}`}
      style={({ pressed }) => ({ backgroundColor: pressed ? pressedColor : 'transparent' })}>
      <View className="flex-row items-center gap-3 px-3.5 py-3">
        <Icon as={capability.icon} size={20} color={IOS_COLORS.labelSecondary} />
        <View className="min-w-0 flex-1">
          <Text numberOfLines={1} className="text-[16px] font-medium text-foreground">
            {t(capability.titleKey)}
          </Text>
          <Text className="text-[13px] leading-5 text-ios-label-secondary">
            {t(capability.summaryKey)}
          </Text>
        </View>
        <View
          className="rounded-full px-2 py-0.5"
          style={{ backgroundColor: `${IOS_COLORS.tint}33` }}>
          <Text className="text-[11px] font-semibold" style={{ color: IOS_COLORS.tint }}>
            {t('pro.badge')}
          </Text>
        </View>
        <Icon as={ArrowUpRight} size={18} color={chevronColor} />
      </View>
    </Pressable>
  );
}

function CapabilityRow({
  capability,
  pressedColor,
  chevronColor,
}: {
  capability: TemplateCapability;
  pressedColor: string;
  chevronColor: string;
}) {
  const { t } = useI18n();
  const routed = capability.href != null;

  const content = (
    <View className="flex-row items-center gap-3 px-3.5 py-3">
      <Icon as={capability.icon} size={20} color={IOS_COLORS.tint} />
      <View className="min-w-0 flex-1">
        <Text numberOfLines={1} className="text-[16px] font-medium text-foreground">
          {t(capability.titleKey)}
        </Text>
        <Text className="text-[13px] leading-5 text-ios-label-secondary">
          {t(capability.summaryKey)}
        </Text>
      </View>
      {capability.status !== 'liveDemo' ? <StatusBadge status={capability.status} /> : null}
      {routed ? <Icon as={ChevronRight} size={18} color={chevronColor} /> : null}
    </View>
  );

  if (!routed) return content;

  return (
    <Pressable
      onPress={() => router.push(capability.href as Href)}
      accessibilityRole="link"
      accessibilityLabel={t(capability.titleKey)}
      style={({ pressed }) => ({ backgroundColor: pressed ? pressedColor : 'transparent' })}>
      {content}
    </Pressable>
  );
}

function StatusBadge({ status }: { status: TemplateCapability['status'] }) {
  const { t } = useI18n();
  const tint = statusTint(status);

  return (
    <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: `${tint}33` }}>
      <Text className="text-[11px] font-semibold" style={{ color: tint }}>
        {t(statusLabelKey(status))}
      </Text>
    </View>
  );
}
