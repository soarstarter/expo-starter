import { cn } from '@/lib/utils';
import * as React from 'react';
import { Keyboard, Pressable } from 'react-native';
import {
  KeyboardAvoidingView,
  KeyboardAwareScrollView,
} from 'react-native-keyboard-controller';

type BaseProps = {
  children: React.ReactNode;
  className?: string;
};

type KeyboardAwareScreenProps = BaseProps & {
  scrollable?: boolean;
  contentContainerClassName?: string;
};

function KeyboardAwareScreen({
  children,
  className,
  scrollable = false,
  contentContainerClassName,
}: KeyboardAwareScreenProps) {
  if (scrollable) {
    return (
      <KeyboardAwareScrollView
        className={cn('flex-1 bg-background', className)}
        contentContainerClassName={contentContainerClassName}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}>
        {children}
      </KeyboardAwareScrollView>
    );
  }

  return (
    <KeyboardAvoidingView behavior="padding" className={cn('flex-1 bg-background', className)}>
      <Pressable className="flex-1" accessible={false} onPress={Keyboard.dismiss}>
        {children}
      </Pressable>
    </KeyboardAvoidingView>
  );
}

export { KeyboardAwareScreen };
export type { KeyboardAwareScreenProps };
