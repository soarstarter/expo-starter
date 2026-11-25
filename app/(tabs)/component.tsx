import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  COMPONENT_GROUPS,
  componentsIn,
  type ComponentEntry,
} from '@/lib/component/component-catalog';
import { getIOSColor, IOS_COLORS } from '@/lib/theme';

export default function ComponentGalleryScreen() {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';

  const pressedColor = getIOSColor('fillPressed', scheme);
  const chevronColor = getIOSColor('labelTertiary', scheme);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 bg-ios-grouped-bg"
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {COMPONENT_GROUPS.map(({ group, title, icon }) => {
        const entries = componentsIn(group);
        if (entries.length === 0) return null;

        return (
          <View key={group} className="mb-8">
            <View className="mb-2 ml-1 flex-row items-center gap-2">
              <Icon as={icon} size={15} color={IOS_COLORS.labelSecondary} />
              <Text className="text-xs uppercase tracking-wide text-ios-label-secondary">
                {title}
              </Text>
            </View>
            <View className="overflow-hidden rounded-xl bg-ios-grouped-surface">
              {entries.map((entry, index) => (
                <React.Fragment key={entry.slug}>
                  {index > 0 ? <View className="ml-[52px] h-px bg-ios-separator-soft" /> : null}
                  <ComponentRow
                    entry={entry}
                    pressedColor={pressedColor}
                    chevronColor={chevronColor}
                  />
                </React.Fragment>
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

function ComponentRow({
  entry,
  pressedColor,
  chevronColor,
}: {
  entry: ComponentEntry;
  pressedColor: string;
  chevronColor: string;
}) {
  return (
    <Pressable
      onPress={() => router.push(`/component/${entry.slug}`)}
      accessibilityRole="link"
      accessibilityLabel={entry.title}
      style={({ pressed }) => ({ backgroundColor: pressed ? pressedColor : 'transparent' })}>
      <View className="flex-row items-center gap-3 px-3.5 py-3">
        <Icon as={entry.icon} size={20} color={IOS_COLORS.tint} />
        <View className="min-w-0 flex-1">
          <Text numberOfLines={1} className="text-[16px] font-medium text-foreground">
            {entry.title}
          </Text>
          <Text className="text-[13px] leading-5 text-ios-label-secondary">{entry.summary}</Text>
        </View>
        <Icon as={ChevronRight} size={18} color={chevronColor} />
      </View>
    </Pressable>
  );
}
