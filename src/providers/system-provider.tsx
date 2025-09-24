import { ThemeProvider } from '@/providers/theme-provider.tsx';
import React from 'react';
import { Tooltip } from '@/components/ui/tooltip';
import { QueryClient, type QueryClientConfig, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';

type Props = {
  children: React.ReactNode[] | React.ReactNode;
};
const config: QueryClientConfig = {};

export function SystemProvider({ children }: Props) {
  const queryClient = new QueryClient(config);

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
