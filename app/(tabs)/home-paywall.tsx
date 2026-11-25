import { PaywallExperience } from '@/app/paywall';
import { Icon } from '@/components/ui/icon';
import { IOS_COLORS } from '@/lib/theme';
import { Tabs } from 'expo-router';
import { X } from 'lucide-react-native';
import { Pressable } from 'react-native';

export default function HomePaywallScreen() {
  return (
    <PaywallExperience
      renderScreenChrome={({ closePaywall, title }) => (
        <Tabs.Screen
          options={{
            title,
            headerShown: true,
            headerTransparent: true,
            headerLeft: () => (
              <Pressable
                onPress={closePaywall}
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={12}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
                <Icon as={X} size={26} color={IOS_COLORS.tint} />
              </Pressable>
            ),
          }}
        />
      )}
    />
  );
}
