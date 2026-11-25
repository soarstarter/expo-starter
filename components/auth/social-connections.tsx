import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export type SocialConnectionType = 'oauth_apple' | 'oauth_google' | 'oauth_github';

const SOCIAL_CONNECTION_STRATEGIES: Record<
  SocialConnectionType,
  { accessibilityLabel: string; providerName: 'apple' | 'google' | 'github' }
> = {
  oauth_apple: {
    accessibilityLabel: 'Sign in with Apple',
    providerName: 'apple',
  },
  oauth_google: {
    accessibilityLabel: 'Sign in with Google',
    providerName: 'google',
  },
  oauth_github: {
    accessibilityLabel: 'Sign in with GitHub',
    providerName: 'github',
  },
};

const ICON_SIZE = 18;

function SocialProviderIcon({
  color,
  providerName,
}: {
  color: string;
  providerName: 'apple' | 'google' | 'github';
}) {
  if (providerName === 'google') {
    return (
      <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 48 48">
        <Path
          fill="#FFC107"
          d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.223 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
        />
        <Path
          fill="#FF3D00"
          d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
        />
        <Path
          fill="#4CAF50"
          d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
        />
        <Path
          fill="#1976D2"
          d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
        />
      </Svg>
    );
  }

  if (providerName === 'github') {
    return (
      <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
        <Path
          fill={color}
          d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.5 11.5 0 0 1 3-.405c1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.921.42.36.81 1.096.81 2.21 0 1.596-.015 2.883-.015 3.274 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12z"
        />
      </Svg>
    );
  }

  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.091-4.61 1.091zm3.378-3.065c.843-1.013 1.4-2.428 1.245-3.831-1.207.052-2.662.805-3.532 1.818-.779.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.701z"
      />
    </Svg>
  );
}

type SocialConnectionsProps = {
  providers?: SocialConnectionType[];
  singleRow?: boolean;
  /** Provider whose sign-in is in flight; its button shows a spinner and all buttons disable. */
  pendingProvider?: SocialConnectionType | null;
  onPress: (provider: SocialConnectionType) => void;
};

export function SocialConnections({
  providers = ['oauth_apple', 'oauth_google', 'oauth_github'],
  singleRow = false,
  pendingProvider = null,
  onPress,
}: SocialConnectionsProps) {
  const { colorScheme } = useColorScheme();
  const monochromeIconColor = colorScheme === 'dark' ? '#fafafa' : '#0a0a0a';

  if (Platform.OS === 'web') {
    return null;
  }

  return (
    <View className={cn(singleRow ? 'flex-row gap-3' : 'gap-2 sm:flex-row sm:gap-3')}>
      {providers.map((provider) => {
        const strategy = SOCIAL_CONNECTION_STRATEGIES[provider];
        const isPending = pendingProvider === provider;
        return (
          <Button
            key={provider}
            variant="outline"
            size="sm"
            disabled={pendingProvider !== null}
            className={cn(singleRow ? 'flex-1' : 'sm:flex-1')}
            accessibilityLabel={strategy.accessibilityLabel}
            onPress={() => onPress(provider)}>
            {isPending ? (
              <ActivityIndicator size="small" />
            ) : (
              <SocialProviderIcon
                color={monochromeIconColor}
                providerName={strategy.providerName}
              />
            )}
          </Button>
        );
      })}
    </View>
  );
}
