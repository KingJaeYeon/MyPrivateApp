import ThemeToggle from '@/components/titlebar/ThemeToggle.tsx';
import { ScheduleController } from '@/components/titlebar/ScheduleController.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Wifi } from 'lucide-react';
import useSettingStore from '@/store/useSettingStore.ts';
import MemoryBadge from '@/components/titlebar/MemoryBadge.tsx';
import { useIsMac } from '@/hooks/use-is-mac.ts';
import { cn } from '@/lib/utils.ts';

export default function TitleBar() {
  const hasApiKey = useSettingStore((s) => !!s.data.youtube.apiKey);
  const isMac =useIsMac()
  return (
    <div
      className={cn(
        'drag bg-background flex h-[36px] w-full items-center justify-end border-b px-3 pl-[80px]', !isMac && 'justify-start pl-3')
      }
    >
      {/* 오른쪽: 컨트롤들 */}
      <div className={cn('no-drag flex items-center gap-2', !isMac && 'flex-row-reverse')}>
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
