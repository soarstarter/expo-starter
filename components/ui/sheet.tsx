import { THEME } from '@/lib/theme';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
  type BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import { useColorScheme } from 'nativewind';
import * as React from 'react';

type SheetRef = BottomSheetModal;

type SheetProps = {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  enableDynamicSizing?: boolean;
  onDismiss?: () => void;
} & Omit<BottomSheetModalProps, 'children' | 'snapPoints' | 'onDismiss'>;

const Sheet = React.forwardRef<SheetRef, SheetProps>(function Sheet(
  { children, snapPoints, enableDynamicSizing = true, onDismiss, ...props },
  ref
) {
  const { colorScheme } = useColorScheme();
  const palette = colorScheme === 'dark' ? THEME.dark : THEME.light;

  const renderBackdrop = React.useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={enableDynamicSizing}
      onDismiss={onDismiss}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: palette.card }}
      handleIndicatorStyle={{ backgroundColor: palette.mutedForeground }}
      {...props}>
      <BottomSheetView style={{ paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8 }}>
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export { Sheet };
export type { SheetProps, SheetRef };
