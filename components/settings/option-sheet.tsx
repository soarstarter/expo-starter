import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { getIOSColor, IOS_COLORS } from '@/lib/theme';
import { Check } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type SheetOption<T extends string> = { value: T; label: string };

/** Bottom sheet with a single-choice list, closed by tapping outside or "Done". */
export function OptionSheet<T extends string>({
  visible,
  title,
  doneLabel,
  options,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  doneLabel: string;
  options: SheetOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}) {
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const pressedColor = getIOSColor('fillPressed', scheme);
  const separatorColor = getIOSColor('separatorSoft', scheme);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="rounded-t-xl bg-ios-grouped-surface"
          style={{ paddingBottom: insets.bottom + 12 }}>
          <View
            className="flex-row items-center justify-between px-4 py-4"
            style={{ borderBottomWidth: 1, borderBottomColor: separatorColor }}>
            <Text className="text-[17px] font-semibold text-foreground">{title}</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={doneLabel}>
              <Text className="text-[17px] text-ios-tint">{doneLabel}</Text>
            </Pressable>
          </View>
          {options.map((option, index) => (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: selected === option.value }}
              onPress={() => {
                onSelect(option.value);
                onClose();
              }}
              style={({ pressed }) => ({
                backgroundColor: pressed ? pressedColor : 'transparent',
                borderBottomWidth: index < options.length - 1 ? 1 : 0,
                borderBottomColor: separatorColor,
              })}>
              <View className="flex-row items-center px-4 py-3.5">
                <Text className="flex-1 text-[17px] text-foreground">{option.label}</Text>
                {selected === option.value && <Icon as={Check} size={22} color={IOS_COLORS.tint} />}
              </View>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
