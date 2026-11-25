import { useOnboarding } from '@/lib/onboarding';
import { router, useSegments, type Href } from 'expo-router';
import * as React from 'react';

const ONBOARDING_EXEMPT_SEGMENTS = new Set(['onboarding', 'refer', 'legal']);

export function OnboardingGate() {
  const { hasCompletedOnboarding, isHydrated } = useOnboarding();
  const segments = useSegments();

  React.useEffect(() => {
    if (!isHydrated || hasCompletedOnboarding) return;
    const firstSegment = segments[0];
    if (firstSegment && ONBOARDING_EXEMPT_SEGMENTS.has(firstSegment)) return;
    router.replace('/onboarding' as Href);
  }, [hasCompletedOnboarding, isHydrated, segments]);

  return null;
}
