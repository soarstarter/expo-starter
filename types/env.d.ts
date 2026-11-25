declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_LINKING_DOMAIN?: string;
      EXPO_PUBLIC_APP_STORE_URL?: string;
      EXPO_PUBLIC_PLAY_STORE_URL?: string;
      EXPO_PUBLIC_TERMS_URL?: string;
      EXPO_PUBLIC_PRIVACY_URL?: string;
      EXPO_PUBLIC_EULA_URL?: string;
    }
  }
}

export {};
