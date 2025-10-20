import { ThemeProvider } from '@/providers/theme-provider.tsx';
import React, { useEffect, useState } from 'react';
import { Tooltip } from '@/components/ui/tooltip';
import { QueryClient, type QueryClientConfig, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import useSettingStore from '@/store/useSettingStore.ts';

type Props = {
  children: React.ReactNode[] | React.ReactNode;
};
const config: QueryClientConfig = {};

export function SystemProvider({ children }: Props) {
  const queryClient = new QueryClient(config);
  const { init } = useSettingStore();
  const [isLoading, setIsLoading] = useState(false);

  // 앱 시작 시 1) 저장된 키 자동 로드
  useEffect(() => {
    async function start() {
      try {
        await init();
        console.log('API Store initialized');
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
        console.log('Initialization complete, loading state set to false', isLoading);
      }
    }

    start();
  }, []);

  if (isLoading) {
    // ✅ 로딩 중일 때 보여줄 화면
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
        {/* 필요하면 "로딩 중..." 텍스트도 함께 */}
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Tooltip delayDuration={0}>
          {children}
          <Toaster />
        </Tooltip>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
