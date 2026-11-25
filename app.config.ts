import type { ConfigContext, ExpoConfig } from 'expo/config';

const BUNDLE_ID = 'com.soarstarter.expostarter';
const SCHEME = 'expo-starter';
const LINKING_DOMAIN = process.env.EXPO_PUBLIC_LINKING_DOMAIN?.trim();
const APP_STORE_URL = process.env.EXPO_PUBLIC_APP_STORE_URL?.trim();
const PLAY_STORE_URL = process.env.EXPO_PUBLIC_PLAY_STORE_URL?.trim();

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Expo Starter',
  slug: 'expo-starter',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: SCHEME,
  userInterfaceStyle: 'automatic',
  assetBundlePatterns: ['assets/images/*', 'assets/fonts/*'],
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: BUNDLE_ID,
    playStoreUrl: PLAY_STORE_URL || undefined,
    permissions: ['CAMERA', 'READ_MEDIA_IMAGES'],
    intentFilters: LINKING_DOMAIN
      ? [
          {
            action: 'VIEW',
            autoVerify: true,
            data: [
              {
                scheme: 'https',
                host: LINKING_DOMAIN,
                pathPrefix: '/',
              },
            ],
            category: ['BROWSABLE', 'DEFAULT'],
          },
        ]
      : undefined,
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#f2f2f7',
        dark: {
          backgroundColor: '#000000',
        },
      },
    ],
    'expo-localization',
    'expo-status-bar',
    ['expo-local-authentication', { faceIDPermission: 'Allow Face ID to unlock the app.' }],
    [
      'expo-tracking-transparency',
      {
        userTrackingPermission:
          'The app asks only to demonstrate this prompt. It does not collect or share this identifier.',
      },
    ],
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: BUNDLE_ID,
    appStoreUrl: APP_STORE_URL || undefined,
    associatedDomains: LINKING_DOMAIN ? [`applinks:${LINKING_DOMAIN}`] : undefined,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSCameraUsageDescription: 'Allow camera access so you can take photos in the app.',
      NSPhotoLibraryUsageDescription:
        'Allow photo access so you can choose images from your library.',
    },
  },
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {},
  },
});
