import { PaywallView, type PaywallPlan } from '@/components/paywall/paywall-view';
import { useUiDemoNotice } from '@/lib/ui-demo';
import * as React from 'react';

// Sample plans for the UI. Replace them with the products from your own purchase service.
const SAMPLE_PLANS: PaywallPlan[] = [
  { id: 'monthly', type: 'monthly', priceText: '$4.99' },
  {
    id: 'annual',
    type: 'annual',
    priceText: '$39.99',
    pricePerMonthText: '$3.33',
    recommended: true,
    savingsPercent: 33,
  },
  { id: 'lifetime', type: 'lifetime', priceText: '$99.99' },
];

type PaywallExperienceProps = Pick<React.ComponentProps<typeof PaywallView>, 'renderScreenChrome'>;

export function PaywallExperience({ renderScreenChrome }: PaywallExperienceProps) {
  const showUiDemoNotice = useUiDemoNotice();

  // UI only: connect purchase and restore to your own purchase service.
  return (
    <PaywallView
      status="ready"
      plans={SAMPLE_PLANS}
      onPurchase={showUiDemoNotice}
      onRestore={showUiDemoNotice}
      renderScreenChrome={renderScreenChrome}
    />
  );
}

export default function PaywallScreen() {
  return <PaywallExperience />;
}
