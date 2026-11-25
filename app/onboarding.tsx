import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useI18n } from '@/lib/i18n';
import { useOnboarding } from '@/lib/onboarding';
import { recordRatingTrigger } from '@/lib/rating';
import { IOS_COLORS } from '@/lib/theme';
import { router, Stack } from 'expo-router';
import { Gift, Hand, ShieldCheck, Sparkles } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const slides = [
  {
    id: 'launch',
    icon: Sparkles,
    titleKey: 'onboarding.slideOneTitle',
    bodyKey: 'onboarding.slideOneBody',
    colorClass: 'bg-ios-tint',
  },
  {
    id: 'protect',
    icon: ShieldCheck,
    titleKey: 'onboarding.slideTwoTitle',
    bodyKey: 'onboarding.slideTwoBody',
    colorClass: 'bg-ios-green',
  },
  {
    id: 'grow',
    icon: Gift,
    titleKey: 'onboarding.slideThreeTitle',
    bodyKey: 'onboarding.slideThreeBody',
    colorClass: 'bg-ios-indigo',
  },
  {
    id: 'permissions',
    icon: Hand,
    titleKey: 'onboarding.slideFourTitle',
    bodyKey: 'onboarding.slideFourBody',
    colorClass: 'bg-ios-orange',
  },
];

export default function OnboardingScreen() {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useOnboarding();
  const [index, setIndex] = React.useState(0);
  const scrollRef = React.useRef<React.ComponentRef<typeof ScrollView>>(null);

  const slideWidth = width;
  const isLastSlide = index === slides.length - 1;

  const goToSlide = React.useCallback(
    (nextIndex: number) => {
      const boundedIndex = Math.min(Math.max(nextIndex, 0), slides.length - 1);
      setIndex(boundedIndex);
      scrollRef.current?.scrollTo({ x: boundedIndex * slideWidth, animated: true });
    },
    [slideWidth]
  );

  const finish = React.useCallback(async () => {
    await completeOnboarding();
    await recordRatingTrigger('onboarding_completed');
    router.replace('/');
  }, [completeOnboarding]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-ios-grouped-bg" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center justify-between px-5 py-3">
          <Text className="text-[17px] font-semibold text-foreground">{t('onboarding.title')}</Text>
          <Pressable
            onPress={finish}
            accessibilityRole="button"
            accessibilityLabel={String(t('onboarding.skip'))}
            hitSlop={12}>
            <Text className="text-[15px] text-ios-tint">{t('onboarding.skip')}</Text>
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onMomentumScrollEnd={(event) => {
            setIndex(Math.round(event.nativeEvent.contentOffset.x / slideWidth));
          }}>
          {slides.map((slide) => (
            <View
              key={slide.id}
              style={{ width: slideWidth }}
              className="flex-1 justify-center px-7 pb-8">
              <View className="items-center gap-6">
                <View
                  className={`h-20 w-20 items-center justify-center rounded-3xl ${slide.colorClass}`}>
                  <Icon as={slide.icon} color={IOS_COLORS.white} size={36} />
                </View>
                <View className="gap-3">
                  <Text className="text-center text-[30px] font-semibold leading-tight text-foreground">
                    {t(slide.titleKey)}
                  </Text>
                  <Text className="text-center text-[16px] leading-6 text-ios-label-secondary">
                    {t(slide.bodyKey)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        <View className="px-5" style={{ paddingBottom: insets.bottom + 16 }}>
          <View className="mb-5 flex-row justify-center gap-2">
            {slides.map((slide, slideIndex) => (
              <Pressable
                key={slide.id}
                onPress={() => goToSlide(slideIndex)}
                accessibilityRole="button"
                accessibilityLabel={`${t('onboarding.slide')} ${slideIndex + 1}`}
                className={`h-2 rounded-full ${
                  slideIndex === index ? 'w-7 bg-ios-tint' : 'w-2 bg-ios-label-tertiary'
                }`}
              />
            ))}
          </View>
          <Button onPress={isLastSlide ? finish : () => goToSlide(index + 1)} size="lg">
            <Text>{isLastSlide ? t('onboarding.getStarted') : t('onboarding.next')}</Text>
          </Button>
        </View>
      </View>
    </>
  );
}
