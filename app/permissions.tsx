import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useI18n } from '@/lib/i18n';
import { IOS_COLORS } from '@/lib/theme';
import { useToast } from '@/lib/toast';
import {
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
} from '@/lib/tracking-permissions';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import { Camera, ChevronLeft, Images, MousePointer2 } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

type PermissionItem = {
  id: 'photos' | 'camera' | 'tracking';
  title: string;
  body: string;
  icon: typeof Camera;
  status: string;
  isLoading: boolean;
  request: () => Promise<void>;
};

function normalizePermissionStatus(status?: string | null) {
  if (!status) return 'unknown';
  return status;
}

const STATUS_LABEL_KEYS: Record<string, string> = {
  granted: 'permissions.statusGranted',
  denied: 'permissions.statusDenied',
  undetermined: 'permissions.statusUndetermined',
};

function permissionStatusLabelKey(status: string) {
  return STATUS_LABEL_KEYS[status] ?? 'permissions.statusUnknown';
}

export default function PermissionsScreen() {
  const { t } = useI18n();
  const { showToast } = useToast();
  const [photoStatus, setPhotoStatus] = React.useState('unknown');
  const [cameraStatus, setCameraStatus] = React.useState('unknown');
  const [trackingStatus, setTrackingStatus] = React.useState('unknown');
  const [loadingId, setLoadingId] = React.useState<PermissionItem['id'] | null>(null);

  React.useEffect(() => {
    ImagePicker.getMediaLibraryPermissionsAsync().then((result) => {
      setPhotoStatus(normalizePermissionStatus(result.status));
    });
    ImagePicker.getCameraPermissionsAsync().then((result) => {
      setCameraStatus(normalizePermissionStatus(result.status));
    });
    getTrackingPermissionsAsync().then((result) => {
      setTrackingStatus(normalizePermissionStatus(result.status));
    });
  }, []);

  const runRequest = React.useCallback(
    async (id: PermissionItem['id'], request: () => Promise<boolean>) => {
      setLoadingId(id);
      const granted = await request();
      setLoadingId(null);
      showToast({
        message: granted ? t('permissions.granted') : t('permissions.denied'),
        variant: granted ? 'success' : 'info',
      });
    },
    [showToast, t]
  );

  const items: PermissionItem[] = [
    {
      id: 'photos',
      title: t('permissions.photosTitle'),
      body: t('permissions.photosBody'),
      icon: Images,
      status: photoStatus,
      isLoading: loadingId === 'photos',
      request: () =>
        runRequest('photos', async () => {
          const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
          setPhotoStatus(normalizePermissionStatus(result.status));
          return result.granted;
        }),
    },
    {
      id: 'camera',
      title: t('permissions.cameraTitle'),
      body: t('permissions.cameraBody'),
      icon: Camera,
      status: cameraStatus,
      isLoading: loadingId === 'camera',
      request: () =>
        runRequest('camera', async () => {
          const result = await ImagePicker.requestCameraPermissionsAsync();
          setCameraStatus(normalizePermissionStatus(result.status));
          return result.granted;
        }),
    },
    {
      id: 'tracking',
      title: t('permissions.trackingTitle'),
      body: t('permissions.trackingBody'),
      icon: MousePointer2,
      status: trackingStatus,
      isLoading: loadingId === 'tracking',
      request: () =>
        runRequest('tracking', async () => {
          const result = await requestTrackingPermissionsAsync();
          setTrackingStatus(normalizePermissionStatus(result.status));
          return result.granted;
        }),
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('permissions.title'),
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              className="mr-2"
              accessibilityRole="button"
              accessibilityLabel={t('profile.cancel')}>
              <Icon as={ChevronLeft} size={28} color={IOS_COLORS.tint} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        className="flex-1 bg-ios-grouped-bg"
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}>
        <View className="mb-2 gap-2">
          <Text className="text-[26px] font-semibold text-foreground">
            {t('permissions.heading')}
          </Text>
          <Text className="text-[15px] leading-6 text-ios-label-secondary">
            {t('permissions.subtitle')}
          </Text>
        </View>

        {items.map((item) => (
          <View key={item.id} className="rounded-xl bg-ios-grouped-surface p-4">
            <View className="flex-row gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-ios-tint">
                <Icon as={item.icon} color={IOS_COLORS.white} size={22} />
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-[17px] font-semibold text-foreground">{item.title}</Text>
                <Text className="text-[14px] leading-5 text-ios-label-secondary">{item.body}</Text>
                <Text className="mt-2 text-xs uppercase text-ios-label-secondary">
                  {t('permissions.status')}: {t(permissionStatusLabelKey(item.status))}
                </Text>
              </View>
            </View>
            <Button
              className="mt-4"
              variant={item.status === 'granted' ? 'secondary' : 'default'}
              disabled={item.isLoading}
              onPress={item.request}>
              {item.isLoading ? <ActivityIndicator color={IOS_COLORS.white} /> : null}
              <Text>
                {item.status === 'granted' ? t('permissions.enabled') : t('permissions.enable')}
              </Text>
            </Button>
          </View>
        ))}

        <Button variant="outline" size="lg" onPress={() => router.replace('/')}>
          <Text>{t('permissions.continue')}</Text>
        </Button>
      </ScrollView>
    </>
  );
}
