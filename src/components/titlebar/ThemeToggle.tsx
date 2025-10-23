import { useState, useEffect } from 'react';

import { Switch } from '@/components/ui/switch.tsx';
import { useTheme } from '@/providers/theme-provider.tsx';

function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [checked, setChecked] = useState(theme === 'light');

  useEffect(() => {
    setChecked(theme === 'light');
  }, [theme]);

  const handleThemeChange = (checked: boolean) => {
    setChecked(checked);
    setTimeout(() => setTheme(checked ? 'light' : 'dark'), 150);
  };

  return (
    <Switch
      className={'no-drag'}
      checked={checked}
      variant={'theme'}
      onCheckedChange={handleThemeChange}
    />
  );
}

export default ThemeToggle;
