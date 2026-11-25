import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isSupported = Platform.OS === 'ios' || Platform.OS === 'android';

const fireAndForget = (run: () => Promise<unknown>) => {
  if (!isSupported) return;
  run().catch(() => {});
};

export const haptics = {
  selection: () => fireAndForget(() => Haptics.selectionAsync()),
  light: () => fireAndForget(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  medium: () => fireAndForget(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  heavy: () => fireAndForget(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
  success: () =>
    fireAndForget(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () =>
    fireAndForget(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error: () =>
    fireAndForget(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
