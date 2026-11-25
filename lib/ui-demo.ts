import { useI18n } from '@/lib/i18n';
import { useToast } from '@/lib/toast';
import * as React from 'react';

/**
 * The sign-in, sign-up, and paywall screens ship as UI only. Their submit callbacks call this
 * instead of a backend; replace those callbacks with your own service calls.
 */
export function useUiDemoNotice() {
  const { t } = useI18n();
  const { showToast } = useToast();

  return React.useCallback(() => {
    showToast({ message: t('uiDemo.notice'), variant: 'info', durationMs: 3600 });
  }, [showToast, t]);
}
