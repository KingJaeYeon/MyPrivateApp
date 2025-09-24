import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/provider/theme-provider.tsx';

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      className={'no-drag'}
      variant="outline"
      size="icon"
      onClick={() => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
      }}
    >
      {theme === 'light' ? (
        <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-100 dark:-rotate-90" />
      )}

      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
