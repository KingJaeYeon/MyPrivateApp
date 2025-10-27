import ThemeToggle from '@/components/titlebar/ThemeToggle.tsx';
import { ScheduleController } from '@/components/titlebar/ScheduleController.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Wifi } from 'lucide-react';
import useSettingStore from '@/store/useSettingStore.ts';
import MemoryBadge from '@/components/titlebar/MemoryBadge.tsx';
import { useIsMac } from '@/hooks/use-is-mac.ts';
import { cn } from '@/lib/utils.ts';
import { IconClose } from '@/assets/svg';

export default function TitleBar() {
  const hasApiKey = useSettingStore((s) => !!s.data.youtube.apiKey);
  const isMac = useIsMac();
  return (
    <div
      className={cn(
        'drag bg-background flex h-[36px] w-full items-center justify-between border-b px-3',
        isMac && 'pl-20'
      )}
    >
      <div className={'flex items-center justify-start gap-2'}>
        {!isMac && (
          <>
            <button
              className={'h-3 w-3 overflow-hidden rounded-full bg-red-400'}
              onClick={() => window.windowsApi.close()}
            >
              <button
                className={'h-full w-full items-center justify-center text-black hover:bg-blue-500'}
              >
                <IconClose className={'h-2 w-2 stroke-2'} />
              </button>
            </button>
          </>
        )}
      </div>
      <div className={cn('no-drag flex items-center gap-2')}>
        {hasApiKey && (
          <Badge variant="secondary" className="h-5 gap-1 text-[10px] font-normal">
            <Wifi className="h-2.5 w-2.5" />
            API 연결됨
          </Badge>
        )}
        <MemoryBadge />
        <ScheduleController />
        <div className="bg-border h-4 w-px" />
        <ThemeToggle />
      </div>
    </div>
  );
}
