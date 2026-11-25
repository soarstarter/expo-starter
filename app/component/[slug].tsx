import { router, Stack, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  CircleCheck,
  CloudOff,
  Inbox,
  RotateCw,
  TriangleAlert,
} from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Sheet, type SheetRef } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { componentForSlug } from '@/lib/component/component-catalog';
import { IOS_COLORS } from '@/lib/theme';
import { useToast } from '@/lib/toast';

export default function ComponentDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const entry = componentForSlug(slug ?? '');

  return (
    <>
      <DetailHeader title={entry?.title ?? 'Component'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 bg-ios-grouped-bg"
        contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 24 }}>
        {entry ? (
          <Demo slug={entry.slug} />
        ) : (
          <Text className="text-[15px] text-ios-label-secondary">Unknown component.</Text>
        )}
      </ScrollView>
    </>
  );
}

/** One labeled example: an uppercase caption, then the component itself. */
function Specimen({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="text-xs font-medium uppercase tracking-wide text-ios-label-secondary">
        {label}
      </Text>
      {children}
    </View>
  );
}

function Demo({ slug }: { slug: string }) {
  switch (slug) {
    case 'buttons':
      return <ButtonsDemo />;
    case 'theme-toggle':
      return <ThemeToggleDemo />;
    case 'text-fields':
      return <TextFieldsDemo />;
    case 'cards':
      return <CardsDemo />;
    case 'separator':
      return <SeparatorDemo />;
    case 'skeleton':
      return <SkeletonDemo />;
    case 'states':
      return <StatesDemo />;
    case 'offline-banner':
      return <OfflineBannerDemo />;
    case 'toast':
      return <ToastDemo />;
    case 'dialog':
      return <DialogDemo />;
    case 'sheet':
      return <SheetDemo />;
    default:
      return null;
  }
}

// MARK: - Controls

function ButtonsDemo() {
  const { showToast } = useToast();
  const tapped = React.useCallback(
    () => showToast({ message: 'Button tapped', variant: 'success' }),
    [showToast]
  );

  return (
    <>
      <Specimen label="Default">
        <Button onPress={tapped}>
          <Text>Continue</Text>
        </Button>
      </Specimen>
      <Specimen label="Secondary">
        <Button variant="secondary" onPress={tapped}>
          <Text>Secondary</Text>
        </Button>
      </Specimen>
      <Specimen label="Outline">
        <Button variant="outline" onPress={tapped}>
          <Text>Outline</Text>
        </Button>
      </Specimen>
      <Specimen label="Destructive">
        <Button variant="destructive" onPress={tapped}>
          <Text>Delete</Text>
        </Button>
      </Specimen>
      <Specimen label="Link">
        <Button variant="link" onPress={tapped}>
          <Text>Link button</Text>
        </Button>
      </Specimen>
      <Specimen label="Loading">
        <Button disabled>
          <ActivityIndicator color="#ffffff" />
          <Text>Loading</Text>
        </Button>
      </Specimen>
      <Specimen label="Disabled">
        <Button disabled>
          <Text>Disabled</Text>
        </Button>
      </Specimen>
    </>
  );
}

function ThemeToggleDemo() {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between rounded-xl bg-ios-grouped-surface p-4">
        <Text className="text-[15px] text-foreground">Appearance</Text>
        <ThemeToggle />
      </View>
      <Text className="text-[13px] leading-5 text-ios-label-secondary">
        Switches the whole app between light and dark instantly.
      </Text>
    </View>
  );
}

// MARK: - Inputs

function TextFieldsDemo() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('secret');

  return (
    <>
      <Specimen label="With email keyboard">
        <View className="gap-1.5">
          <Label>Email</Label>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>
      </Specimen>
      <Specimen label="Secure entry">
        <View className="gap-1.5">
          <Label>Password</Label>
          <Input value={password} onChangeText={setPassword} secureTextEntry />
        </View>
      </Specimen>
      <Specimen label="Inline error">
        <View className="gap-1.5">
          <Label>Password</Label>
          <Input
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="border-destructive"
          />
          <Text className="text-[13px] text-destructive">Must be at least 8 characters.</Text>
        </View>
      </Specimen>
      <Specimen label="Disabled">
        <View className="gap-1.5">
          <Label>Full name</Label>
          <Input value="Ada Lovelace" editable={false} />
        </View>
      </Specimen>
    </>
  );
}

// MARK: - Containers

function CardsDemo() {
  return (
    <>
      <Specimen label="Header, body, footer">
        <Card>
          <CardHeader>
            <CardTitle>Upgrade to Pro</CardTitle>
            <CardDescription>Unlock every demo in the template.</CardDescription>
          </CardHeader>
          <CardContent>
            <Text className="text-[15px] leading-6 text-muted-foreground">
              Cards group related content on a raised surface with rounded corners and a hairline
              border.
            </Text>
          </CardContent>
          <CardFooter>
            <Button className="flex-1">
              <Text>Confirm</Text>
            </Button>
          </CardFooter>
        </Card>
      </Specimen>
      <Specimen label="Content only">
        <Card>
          <CardContent>
            <Text className="text-[15px] text-foreground">
              A bare card with a single content slot.
            </Text>
          </CardContent>
        </Card>
      </Specimen>
    </>
  );
}

function SeparatorDemo() {
  return (
    <>
      <Specimen label="Horizontal">
        <View className="rounded-xl bg-ios-grouped-surface px-4">
          <Text className="py-3 text-[15px] text-foreground">First row</Text>
          <Separator />
          <Text className="py-3 text-[15px] text-foreground">Second row</Text>
          <Separator />
          <Text className="py-3 text-[15px] text-foreground">Third row</Text>
        </View>
      </Specimen>
      <Specimen label="Vertical">
        <View className="h-6 flex-row items-center gap-3">
          <Text className="text-[15px] text-foreground">Edit</Text>
          <Separator orientation="vertical" />
          <Text className="text-[15px] text-foreground">Share</Text>
          <Separator orientation="vertical" />
          <Text className="text-[15px] text-foreground">Delete</Text>
        </View>
      </Specimen>
    </>
  );
}

function SkeletonDemo() {
  return (
    <Specimen label="Loading placeholder">
      <View className="gap-4 rounded-xl bg-ios-grouped-surface p-4">
        <View className="flex-row items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <View className="flex-1 gap-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </View>
        </View>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </View>
    </Specimen>
  );
}

// MARK: - Feedback

const STATE_KINDS = ['loading', 'empty', 'error', 'data'] as const;
type StateKind = (typeof STATE_KINDS)[number];
const STATE_LABELS: Record<StateKind, string> = {
  loading: 'Loading',
  empty: 'Empty',
  error: 'Error',
  data: 'Data',
};

function StatesDemo() {
  const [kind, setKind] = React.useState<StateKind>('loading');

  return (
    <View className="gap-4">
      <View className="flex-row gap-2">
        {STATE_KINDS.map((value) => (
          <Button
            key={value}
            variant={kind === value ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onPress={() => setKind(value)}>
            <Text>{STATE_LABELS[value]}</Text>
          </Button>
        ))}
      </View>
      <View className="min-h-[200px] items-center justify-center rounded-xl bg-ios-grouped-surface p-6">
        <StateContent kind={kind} onRetry={() => setKind('loading')} />
      </View>
    </View>
  );
}

function StateContent({ kind, onRetry }: { kind: StateKind; onRetry: () => void }) {
  switch (kind) {
    case 'loading':
      return (
        <View className="w-full gap-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </View>
      );
    case 'empty':
      return (
        <View className="items-center gap-2">
          <Icon as={Inbox} size={36} color={IOS_COLORS.labelSecondary} />
          <Text className="text-[15px] font-medium text-foreground">Nothing here yet</Text>
          <Text className="text-center text-[13px] text-ios-label-secondary">
            Items you add will show up in this space.
          </Text>
        </View>
      );
    case 'error':
      return (
        <View className="items-center gap-3">
          <Icon as={TriangleAlert} size={36} color={IOS_COLORS.orange} />
          <Text className="text-center text-[13px] text-ios-label-secondary">
            We couldn&apos;t load this. Check your connection and try again.
          </Text>
          <Button variant="outline" size="sm" onPress={onRetry}>
            <Icon as={RotateCw} size={16} color={IOS_COLORS.tint} />
            <Text>Retry</Text>
          </Button>
        </View>
      );
    case 'data':
      return (
        <View className="items-center gap-2">
          <Icon as={CircleCheck} size={36} color={IOS_COLORS.green} />
          <Text className="text-[15px] text-foreground">Loaded content renders here.</Text>
        </View>
      );
  }
}

function OfflineBannerDemo() {
  const [offline, setOffline] = React.useState(true);

  return (
    <View className="gap-3">
      <Button variant="secondary" onPress={() => setOffline((value) => !value)}>
        <Text>{offline ? 'Simulate online' : 'Simulate offline'}</Text>
      </Button>
      <View className="h-12 justify-center">
        {offline ? (
          <View className="flex-row items-center gap-2 rounded-xl bg-destructive px-4 py-2.5">
            <Icon as={CloudOff} size={16} color={IOS_COLORS.white} />
            <Text className="flex-1 text-sm font-medium text-white">No internet connection</Text>
          </View>
        ) : (
          <Text className="text-[13px] text-ios-label-secondary">Online — banner hidden.</Text>
        )}
      </View>
      <Text className="text-[13px] leading-5 text-ios-label-secondary">
        The banner (components/offline-banner.tsx) is opt-in — it is not mounted by default. Wrap
        the navigator in NetworkStatusProvider and render the banner above it if your app needs a
        global connectivity indicator.
      </Text>
    </View>
  );
}

function ToastDemo() {
  const { showToast } = useToast();

  return (
    <>
      <Button onPress={() => showToast({ message: 'Saved successfully', variant: 'success' })}>
        <Text>Show success</Text>
      </Button>
      <Button
        variant="destructive"
        onPress={() => showToast({ message: 'Something went wrong', variant: 'error' })}>
        <Text>Show error</Text>
      </Button>
      <Button
        variant="secondary"
        onPress={() => showToast({ message: 'Heads up — this is an info toast', variant: 'info' })}>
        <Text>Show info</Text>
      </Button>
    </>
  );
}

function DialogDemo() {
  return (
    <Specimen label="Modal alert">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary">
            <Text>Open dialog</Text>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete item?</DialogTitle>
            <DialogDescription>
              This permanently removes the item. You can&apos;t undo this action.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
                <Text>Cancel</Text>
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="destructive">
                <Text>Delete</Text>
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Specimen>
  );
}

function SheetDemo() {
  const sheetRef = React.useRef<SheetRef>(null);

  return (
    <Specimen label="Bottom sheet">
      <Button variant="secondary" onPress={() => sheetRef.current?.present()}>
        <Text>Open sheet</Text>
      </Button>
      <Sheet ref={sheetRef}>
        <View className="gap-3">
          <Text className="text-lg font-semibold text-foreground">Quick actions</Text>
          <Text className="text-[15px] leading-6 text-muted-foreground">
            A bottom sheet slides up from the edge and dismisses on swipe-down or a backdrop tap.
          </Text>
          <Button onPress={() => sheetRef.current?.dismiss()}>
            <Text>Done</Text>
          </Button>
        </View>
      </Sheet>
    </Specimen>
  );
}

function DetailHeader({ title }: { title: string }) {
  return (
    <Stack.Screen
      options={{
        headerShown: true,
        title,
        headerLeft: () => (
          <Pressable
            onPress={() => router.back()}
            className="mr-2"
            accessibilityRole="button"
            accessibilityLabel="Back">
            <Icon as={ChevronLeft} size={28} color={IOS_COLORS.tint} />
          </Pressable>
        ),
      }}
    />
  );
}
