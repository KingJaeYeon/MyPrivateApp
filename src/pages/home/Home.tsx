import { useTheme } from '@/providers/theme-provider.tsx';

export function Home() {
  const { theme } = useTheme();
  return (
    <div className={'flex h-full w-full flex-1 flex-col items-center justify-center gap-6'}>
      <img
        src={theme === 'dark' ? './logo-dark.png' : './logo.png'}
        className={'w-[300px]'}
        alt={'logo'}
      />
      <div className={'font-mono text-3xl'}>WELCOME TO PRIVATE APP!!</div>
    </div>
  );
}
