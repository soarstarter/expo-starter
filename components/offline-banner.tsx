import { Text } from '@/components/ui/text';
import { useI18n } from '@/lib/i18n';
import { useNetworkStatus } from '@/lib/network-status';
import { CloudOff } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';

export function OfflineBanner() {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  const offline = !isConnected || isInternetReachable === false;
  if (!offline) {
    return null;
  }

  return (
    <View
      className="absolute left-0 right-0 z-50 flex-row items-center gap-2 bg-destructive px-4 py-2"
      style={{ paddingTop: insets.top + 8 }}>
      <Icon as={CloudOff} size={16} color="#ffffff" />
      <Text className="flex-1 text-sm font-medium text-white">{t('common.offline')}</Text>
    </View>
  );
}
