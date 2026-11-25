import { OptionSheet, type SheetOption } from '@/components/settings/option-sheet';
import { SettingsRow, SettingsSection } from '@/components/settings/settings-list';
import { useBiometric } from '@/lib/biometric';
import { useI18n, type SupportedLocale } from '@/lib/i18n';
import { IOS_COLORS } from '@/lib/theme';
import { useThemePreference, type ThemePreference } from '@/lib/theme-preference';
import { useToast } from '@/lib/toast';
import { router, type Href } from 'expo-router';
import { FileText, Globe, Palette, ScanFace, ShieldCheck } from 'lucide-react-native';
import * as React from 'react';
import { Switch } from 'react-native';

/** Settings stored on this device; none of them need a signed-in user. */
export function DeviceSettingsSection() {
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useThemePreference();
  const { showToast } = useToast();
  const appLock = useBiometric();

  const [openSheet, setOpenSheet] = React.useState<'theme' | 'language' | null>(null);
  const [isTogglingLock, setIsTogglingLock] = React.useState(false);

  const themeOptions: SheetOption<ThemePreference>[] = [
    { value: 'light', label: t('profile.light') },
    { value: 'dark', label: t('profile.dark') },
    { value: 'system', label: t('profile.system') },
  ];
  const languageOptions: SheetOption<SupportedLocale>[] = [
    { value: 'en', label: t('profile.english') },
    { value: 'zh', label: t('profile.chinese') },
  ];

  const lockSupported = appLock.capability.hasHardware && appLock.capability.isEnrolled;
  const lockFooter = lockSupported
    ? t('biometric.hint')
    : !appLock.capability.hasHardware
      ? t('biometric.unavailable')
      : t('biometric.notEnrolled');

  const handleLockToggle = async (next: boolean) => {
    if (isTogglingLock) return;
    setIsTogglingLock(true);
    const result = await appLock.setEnabled(next);
    setIsTogglingLock(false);
    if (!result.ok) {
      showToast({ message: result.error ?? t('biometric.unavailable'), variant: 'error' });
      return;
    }
    showToast({
      message: next ? t('biometric.enabled') : t('biometric.disabled'),
      variant: 'success',
    });
  };

  return (
    <>
      <SettingsSection title={t('settings.title')} footer={lockFooter}>
        <SettingsRow
          icon={Palette}
          iconColor={IOS_COLORS.indigo}
          title={t('profile.theme')}
          value={themeOptions.find((option) => option.value === theme)?.label}
          onPress={() => setOpenSheet('theme')}
          showSeparator
        />
        <SettingsRow
          icon={Globe}
          iconColor={IOS_COLORS.tint}
          title={t('profile.language')}
          value={languageOptions.find((option) => option.value === locale)?.label}
          onPress={() => setOpenSheet('language')}
          showSeparator
        />
        <SettingsRow
          icon={ShieldCheck}
          iconColor={IOS_COLORS.tint}
          title={t('permissions.title')}
          onPress={() => router.push('/permissions' as Href)}
          showSeparator
        />
        <SettingsRow
          icon={FileText}
          iconColor={IOS_COLORS.indigo}
          title={t('legal.title')}
          onPress={() => router.push('/legal' as Href)}
          showSeparator
        />
        <SettingsRow
          icon={ScanFace}
          iconColor={IOS_COLORS.green}
          title={t('biometric.title')}
          accessory={
            <Switch
              value={appLock.isEnabled}
              onValueChange={handleLockToggle}
              disabled={!lockSupported || isTogglingLock}
              accessibilityRole="switch"
              accessibilityLabel={t('biometric.title')}
              accessibilityState={{ checked: appLock.isEnabled }}
            />
          }
        />
      </SettingsSection>

      <OptionSheet
        visible={openSheet === 'theme'}
        title={t('profile.theme')}
        doneLabel={t('common.done')}
        options={themeOptions}
        selected={theme}
        onSelect={(value) => void setTheme(value)}
        onClose={() => setOpenSheet(null)}
      />
      <OptionSheet
        visible={openSheet === 'language'}
        title={t('profile.language')}
        doneLabel={t('common.done')}
        options={languageOptions}
        selected={locale}
        onSelect={(value) => void setLocale(value)}
        onClose={() => setOpenSheet(null)}
      />
    </>
  );
}
