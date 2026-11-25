import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { logger } from '@/lib/logger';
import { reloadAppAsync } from 'expo';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

type ErrorScreenProps = {
  error: Error;
  onTryAgain: () => void;
};

function ErrorScreen({ error, onTryAgain }: ErrorScreenProps) {
  const isDev = __DEV__;
  const message = error?.message ?? 'Something went wrong.';
  const [isReloading, setIsReloading] = React.useState(false);

  const handleReload = React.useCallback(async () => {
    if (isReloading) return;
    setIsReloading(true);
    try {
      await reloadAppAsync('Reload requested from the error screen');
    } catch (err) {
      logger.warn('reloadAppAsync failed; falling back to in-app reset', { error: err });
      onTryAgain();
    } finally {
      setIsReloading(false);
    }
  }, [isReloading, onTryAgain]);

  return (
    <View className="flex-1 items-center justify-center bg-background px-6 py-10">
      <View className="w-full max-w-md gap-5">
        <View className="items-center gap-3">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Icon as={AlertTriangle} size={32} className="text-destructive" />
          </View>
          <Text className="text-center text-2xl font-semibold text-foreground">
            Something went wrong
          </Text>
          <Text className="text-center text-sm text-muted-foreground">
            The app hit an unexpected error. You can try again or reload the app.
          </Text>
        </View>

        {isDev ? (
          <View className="rounded-xl border border-border bg-card p-3">
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Error details
            </Text>
            <ScrollView className="mt-2 max-h-48">
              <Text className="text-xs text-destructive">{message}</Text>
              {error?.stack ? (
                <Text className="mt-2 text-xs text-muted-foreground">{error.stack}</Text>
              ) : null}
            </ScrollView>
          </View>
        ) : null}

        <View className="gap-2">
          <Pressable
            onPress={onTryAgain}
            accessibilityRole="button"
            accessibilityLabel="Try again"
            className="flex-row items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3">
            <Icon as={RefreshCw} size={16} className="text-primary-foreground" />
            <Text className="text-base font-semibold text-primary-foreground">Try again</Text>
          </Pressable>

          <Pressable
            onPress={handleReload}
            disabled={isReloading}
            accessibilityRole="button"
            accessibilityLabel="Reload app"
            className="flex-row items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3">
            <Text className="text-base font-semibold text-foreground">
              {isReloading ? 'Reloading...' : 'Reload app'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

type ExpoRouterErrorBoundaryProps = {
  error: Error;
  retry: () => Promise<unknown> | void;
};

export class ErrorBoundary extends React.Component<ExpoRouterErrorBoundaryProps> {
  componentDidMount() {
    this.logError();
  }

  componentDidUpdate(previousProps: ExpoRouterErrorBoundaryProps) {
    if (previousProps.error !== this.props.error) {
      this.logError();
    }
  }

  private logError() {
    logger.error('Route error boundary caught error', this.props.error);
  }

  render() {
    const { error, retry } = this.props;
    return <ErrorScreen error={error} onTryAgain={() => void retry()} />;
  }
}

type RootErrorBoundaryState = {
  error: Error | null;
};

export class RootErrorBoundary extends React.Component<
  React.PropsWithChildren,
  RootErrorBoundaryState
> {
  state: RootErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): Partial<RootErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error('Root error boundary caught error', error, {
      componentStack: info.componentStack ?? null,
    });
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (error) {
      return <ErrorScreen error={error} onTryAgain={this.reset} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
