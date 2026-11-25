import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { LEGAL_URLS } from '@/lib/legal';
import { useI18n } from '@/lib/i18n';
import { getIOSColor, IOS_COLORS } from '@/lib/theme';
import { router, Stack } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const APPLE_STANDARD_EULA = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

export type PaywallPlanType = 'monthly' | 'annual' | 'lifetime' | 'other';

/** One purchasable option, already formatted for display. */
export type PaywallPlan = {
  id: string;
  type: PaywallPlanType;
  /** Shown for `other` plans; the known types use translated labels. */
  title?: string;
  /** Localized price, e.g. "$39.99". */
  priceText: string;
  /** Localized monthly equivalent for subscriptions, e.g. "$3.33". */
  pricePerMonthText?: string | null;
  /** Highlighted as popular and selected by default. */
  recommended?: boolean;
  /** Percent saved compared with paying monthly, shown as a badge. */
  savingsPercent?: number | null;
};

/**
 * - `loading`: plans or ownership are still resolving
 * - `owned`: the user already has access
 * - `sign-in-required`: purchases need an account first
 * - `unavailable`: purchases are not set up in this build
 * - `load-error`: plans failed to load; offers a retry
 * - `ready`: show the plans
 */
export type PaywallStatus =
  | 'loading'
  | 'owned'
  | 'sign-in-required'
  | 'unavailable'
  | 'load-error'
  | 'ready';

export function closePaywall() {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace('/');
}

type PaywallScreenChrome = (input: { closePaywall: () => void; title: string }) => React.ReactNode;

type PaywallViewProps = {
  status: PaywallStatus;
  plans: PaywallPlan[];
  isPurchasing?: boolean;
  isRestoring?: boolean;
  isReloading?: boolean;
  /** False while the purchase identity is still settling; dims and disables the buy button. */
  isPurchaseReady?: boolean;
  onPurchase: (planId: string) => void;
  onRestore: () => void;
  onReload?: () => void;
  /** Shows the "redeem code" link when provided. */
  onRedeemCode?: () => void;
  renderScreenChrome?: PaywallScreenChrome;
};

function planLabel(plan: PaywallPlan, t: (key: string) => string): string {
  switch (plan.type) {
    case 'monthly':
      return t('paywall.monthly');
    case 'annual':
      return t('paywall.yearly');
    case 'lifetime':
      return t('paywall.lifetime');
    default:
      return plan.title || plan.id;
  }
}

function planPeriodHint(plan: PaywallPlan, t: (key: string) => string): string | null {
  switch (plan.type) {
    case 'monthly':
      return t('paywall.perMonth');
    case 'annual':
      return t('paywall.perYear');
    case 'lifetime':
      return t('paywall.oneTime');
    default:
      return null;
  }
}

function isSubscriptionPlan(plan: PaywallPlan) {
  return plan.type === 'monthly' || plan.type === 'annual';
}

export function PaywallView({
  status,
  plans,
  isPurchasing = false,
  isRestoring = false,
  isReloading = false,
  isPurchaseReady = true,
  onPurchase,
  onRestore,
  onReload,
  onRedeemCode,
  renderScreenChrome,
}: PaywallViewProps) {
  const { t } = useI18n();
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();

  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const surfaceColor = getIOSColor('groupedSurface', scheme);
  const groupedBg = getIOSColor('groupedBg', scheme);
  const labelSecondary = getIOSColor('labelSecondary', scheme);
  const separator = getIOSColor('separatorSoft', scheme);

  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);

  const hasSubscriptionOption = plans.some(isSubscriptionPlan);
  const defaultPlan = plans.find((plan) => plan.recommended) ?? plans[0];
  const activePlanId = plans.some((plan) => plan.id === selectedPlanId)
    ? selectedPlanId
    : defaultPlan?.id;

  const handlePurchase = React.useCallback(() => {
    if (!activePlanId || isPurchasing) return;
    onPurchase(activePlanId);
  }, [activePlanId, isPurchasing, onPurchase]);

  const handleRestore = React.useCallback(() => {
    if (isRestoring) return;
    onRestore();
  }, [isRestoring, onRestore]);

  const openTerms = React.useCallback(() => {
    const url = LEGAL_URLS.terms || LEGAL_URLS.eula || APPLE_STANDARD_EULA;
    void Linking.openURL(url);
  }, []);

  const openPrivacy = React.useCallback(() => {
    if (LEGAL_URLS.privacy) {
      void Linking.openURL(LEGAL_URLS.privacy);
      return;
    }
    router.push('/legal/privacy');
  }, []);

  return (
    <>
      {renderScreenChrome ? (
        renderScreenChrome({ closePaywall, title: t('paywall.title') })
      ) : (
        <Stack.Screen
          options={{
            title: '',
            headerShown: true,
            headerTransparent: true,
            headerLeft: () => (
              <Pressable
                onPress={closePaywall}
                accessibilityRole="button"
                accessibilityLabel={t('profile.cancel')}
                hitSlop={12}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
                <Icon as={X} size={26} color={IOS_COLORS.tint} />
              </Pressable>
            ),
          }}
        />
      )}

      <View className="flex-1" style={{ backgroundColor: groupedBg }}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 56,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 20,
          }}
          showsVerticalScrollIndicator={false}>
          <Text className="text-[34px] font-bold text-foreground">{t('paywall.title')}</Text>
          <Text className="mt-2 text-[16px]" style={{ color: labelSecondary }}>
            {t('paywall.subtitle')}
          </Text>

          <View
            className="mt-6 overflow-hidden rounded-2xl"
            style={{ backgroundColor: surfaceColor }}>
            {[
              t('paywall.features.unlimited'),
              t('paywall.features.priority'),
              t('paywall.features.noAds'),
              t('paywall.features.future'),
            ].map((feature, index, arr) => (
              <View
                key={feature}
                className="flex-row items-center px-4 py-3.5"
                style={
                  index < arr.length - 1
                    ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: separator }
                    : undefined
                }>
                <View className="mr-3 h-7 w-7 items-center justify-center rounded-full bg-ios-tint">
                  <Icon as={Check} size={16} color={IOS_COLORS.white} />
                </View>
                <Text className="flex-1 text-[16px] text-foreground">{feature}</Text>
              </View>
            ))}
          </View>

          {status === 'loading' ? (
            <View className="mt-12 items-center">
              <ActivityIndicator color={IOS_COLORS.tint} />
            </View>
          ) : status === 'owned' ? (
            <View className="mt-8 rounded-2xl px-5 py-6" style={{ backgroundColor: surfaceColor }}>
              <Text className="text-center text-[17px] font-semibold text-foreground">
                {t('paywall.alreadyPro')}
              </Text>
            </View>
          ) : status === 'sign-in-required' ? (
            <View
              className="mt-8 gap-4 rounded-2xl px-5 py-6"
              style={{ backgroundColor: surfaceColor }}>
              <Text className="text-center text-[15px]" style={{ color: labelSecondary }}>
                {t('paywall.signInRequired')}
              </Text>
              <Pressable
                onPress={() => router.push('/login')}
                accessibilityRole="button"
                accessibilityLabel={t('common.signIn')}
                className="h-12 items-center justify-center rounded-xl bg-ios-tint"
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
                <Text className="text-[16px] font-semibold text-white">{t('common.signIn')}</Text>
              </Pressable>
            </View>
          ) : status === 'unavailable' ? (
            <View className="mt-8 rounded-2xl px-5 py-6" style={{ backgroundColor: surfaceColor }}>
              <Text className="text-center text-[15px]" style={{ color: labelSecondary }}>
                {t('paywall.unavailable')}
              </Text>
            </View>
          ) : status === 'load-error' ? (
            <View className="mt-8 items-center gap-3">
              <Text className="text-center text-[15px]" style={{ color: labelSecondary }}>
                {t('paywall.loadError')}
              </Text>
              {onReload ? (
                <Pressable
                  onPress={onReload}
                  accessibilityRole="button"
                  accessibilityLabel={t('paywall.tryAgain')}
                  disabled={isReloading}
                  className="rounded-full bg-ios-tint px-5 py-2.5"
                  style={({ pressed }) => ({ opacity: pressed || isReloading ? 0.7 : 1 })}>
                  {isReloading ? (
                    <ActivityIndicator size="small" color={IOS_COLORS.white} />
                  ) : (
                    <Text className="text-[15px] font-semibold text-white">
                      {t('paywall.tryAgain')}
                    </Text>
                  )}
                </Pressable>
              ) : null}
            </View>
          ) : (
            <View className="mt-8 gap-3">
              {plans.map((plan) => {
                const selected = plan.id === activePlanId;
                const isLifetime = plan.type === 'lifetime';
                const periodHint = planPeriodHint(plan, t);
                return (
                  <Pressable
                    key={plan.id}
                    onPress={() => setSelectedPlanId(plan.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}>
                    {/* The card styles live on a plain View: a style callback on this Pressable
                        is not applied, which left the selected plan without its border. */}
                    {({ pressed }) => (
                      <View
                        className="flex-row items-center"
                        style={{
                          backgroundColor: surfaceColor,
                          borderRadius: 16,
                          borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
                          borderColor: selected ? IOS_COLORS.tint : separator,
                          paddingHorizontal: 16,
                          paddingVertical: 14,
                          opacity: pressed ? 0.85 : 1,
                        }}>
                        <View className="flex-1">
                          <View className="flex-row flex-wrap items-center gap-2">
                            <Text className="text-[17px] font-semibold text-foreground">
                              {planLabel(plan, t)}
                            </Text>
                            {plan.savingsPercent ? (
                              <View className="rounded-full bg-ios-green px-2 py-0.5">
                                <Text className="text-[11px] font-semibold text-white">
                                  {t('paywall.savings', { percent: plan.savingsPercent })}
                                </Text>
                              </View>
                            ) : null}
                            {plan.recommended ? (
                              <View className="rounded-full bg-ios-orange px-2 py-0.5">
                                <Text className="text-[11px] font-semibold text-white">
                                  {t('paywall.popular')}
                                </Text>
                              </View>
                            ) : null}
                            {isLifetime ? (
                              <View className="rounded-full bg-ios-indigo px-2 py-0.5">
                                <Text className="text-[11px] font-semibold text-white">
                                  {t('paywall.bestValue')}
                                </Text>
                              </View>
                            ) : null}
                          </View>
                          {plan.pricePerMonthText && !isLifetime ? (
                            <Text className="mt-1 text-[13px]" style={{ color: labelSecondary }}>
                              {plan.pricePerMonthText}
                              {t('paywall.perMonth')}
                            </Text>
                          ) : null}
                        </View>
                        <View className="ml-3 items-end">
                          <Text className="text-[17px] font-semibold text-foreground">
                            {plan.priceText}
                          </Text>
                          {periodHint ? (
                            <Text className="mt-0.5 text-[12px]" style={{ color: labelSecondary }}>
                              {periodHint}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    )}
                  </Pressable>
                );
              })}

              <Pressable
                onPress={handlePurchase}
                accessibilityRole="button"
                accessibilityLabel={t('paywall.continue')}
                disabled={isPurchasing || !activePlanId || !isPurchaseReady}
                className="mt-3 h-14 items-center justify-center rounded-2xl bg-ios-tint"
                style={({ pressed }) => ({
                  opacity: pressed || isPurchasing || !isPurchaseReady ? 0.85 : 1,
                })}>
                {isPurchasing ? (
                  <ActivityIndicator color={IOS_COLORS.white} />
                ) : (
                  <Text className="text-[17px] font-semibold text-white">
                    {t('paywall.continue')}
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={handleRestore}
                accessibilityRole="button"
                accessibilityLabel={t('paywall.restore')}
                disabled={isRestoring}
                className="mt-2 items-center justify-center py-2"
                style={({ pressed }) => ({ opacity: pressed || isRestoring ? 0.6 : 1 })}>
                {isRestoring ? (
                  <ActivityIndicator size="small" color={IOS_COLORS.tint} />
                ) : (
                  <Text className="text-[15px] text-ios-tint">{t('paywall.restore')}</Text>
                )}
              </Pressable>

              {onRedeemCode ? (
                <Pressable
                  onPress={onRedeemCode}
                  accessibilityRole="button"
                  accessibilityLabel={String(t('paywall.redeemCode'))}
                  className="mt-1 items-center justify-center py-2"
                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
                  <Text className="text-[15px] text-ios-tint">{t('paywall.redeemCode')}</Text>
                </Pressable>
              ) : null}

              <View className="mt-4 px-2">
                <Text className="text-center text-[12px]" style={{ color: labelSecondary }}>
                  {hasSubscriptionOption
                    ? t('paywall.subscriptionDisclosure')
                    : t('paywall.oneTimeDisclosure')}
                </Text>
                {hasSubscriptionOption ? (
                  <View className="mt-2 flex-row flex-wrap justify-center gap-x-3 gap-y-1">
                    <Pressable onPress={openTerms} accessibilityRole="link">
                      <Text className="text-[12px] font-semibold text-ios-tint">
                        {t('legal.terms.title')}
                      </Text>
                    </Pressable>
                    <Pressable onPress={openPrivacy} accessibilityRole="link">
                      <Text className="text-[12px] font-semibold text-ios-tint">
                        {t('legal.privacy.title')}
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}
