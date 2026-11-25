import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { getIOSColor, IOS_COLORS } from '@/lib/theme';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Pressable, View } from 'react-native';

export function SettingsSection({
  title,
  footer,
  children,
}: {
  title: string;
  footer?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Text className="mb-2 ml-1 mt-5 text-[12px] font-semibold text-ios-label-secondary">
        {title}
      </Text>
      <View className="overflow-hidden rounded-2xl bg-ios-grouped-surface">{children}</View>
      {footer ? (
        <Text className="ml-1 mr-1 mt-2 text-[12px] leading-4 text-ios-label-secondary">
          {footer}
        </Text>
      ) : null}
    </>
  );
}

export function SettingsRow({
  icon,
  iconColor,
  title,
  value,
  accessory,
  onPress,
  showSeparator = false,
  destructive = false,
}: {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  /** Current value shown before the chevron, e.g. the selected language. */
  value?: string;
  /** Replaces the chevron, e.g. a switch. Rows with an accessory are not pressable. */
  accessory?: React.ReactNode;
  onPress?: () => void;
  showSeparator?: boolean;
  destructive?: boolean;
}) {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const pressedColor = getIOSColor('fillPressed', scheme);
  const chevronColor = getIOSColor('labelTertiary', scheme);

  const content = (
    <View className="flex-row items-center justify-between px-3.5 py-3">
      <View className="mr-3 min-w-0 flex-1 flex-row items-center">
        <View
          className="mr-3 items-center justify-center"
          style={{
            width: 28,
            height: 28,
            flexShrink: 0,
            backgroundColor: iconColor,
            borderRadius: 7,
            borderCurve: 'continuous',
          }}>
          <Icon
            as={icon}
            size={15}
            color={IOS_COLORS.white}
            strokeWidth={2.25}
            absoluteStrokeWidth
          />
        </View>
        <Text
          numberOfLines={1}
          className={`shrink text-[15px] ${destructive ? 'text-ios-destructive' : 'text-foreground'}`}>
          {title}
        </Text>
      </View>
      {accessory ?? (
        <View className="flex-row items-center">
          {value ? (
            <Text numberOfLines={1} className="mr-1.5 text-[15px] text-ios-label-secondary">
              {value}
            </Text>
          ) : null}
          {!destructive && (
            <Icon
              as={ChevronRight}
              size={14}
              color={chevronColor}
              strokeWidth={2.5}
              absoluteStrokeWidth
            />
          )}
        </View>
      )}
    </View>
  );

  return (
    <>
      {accessory || !onPress ? (
        content
      ) : (
        <Pressable
          onPress={onPress}
          accessibilityRole={destructive ? 'button' : 'link'}
          accessibilityLabel={value ? `${title}, ${value}` : title}
          style={({ pressed }) => ({
            backgroundColor: pressed ? pressedColor : 'transparent',
          })}>
          {content}
        </Pressable>
      )}
      {showSeparator && <View className="ml-[52px] h-px bg-ios-separator-soft" />}
    </>
  );
}
