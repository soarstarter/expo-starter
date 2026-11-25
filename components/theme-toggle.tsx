import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useThemePreference } from '@/lib/theme-preference';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

export function ThemeToggle() {
  const { colorScheme } = useColorScheme();
  const { setTheme } = useThemePreference();

  return (
    <Button
      onPressIn={() => void setTheme(colorScheme === 'dark' ? 'light' : 'dark')}
      size="icon"
      variant="ghost"
      className="ios:size-9 rounded-full web:mx-4">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
    </Button>
  );
}
