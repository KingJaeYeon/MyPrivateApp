import ThemeToggle from '@/components/titlebar/ThemeToggle.tsx';
import { ScheduleController } from '@/components/titlebar/ScheduleController.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Maximize2Icon, Wifi } from 'lucide-react';
import useSettingStore from '@/store/useSettingStore.ts';
import MemoryBadge from '@/components/titlebar/MemoryBadge.tsx';
import { useIsMac } from '@/hooks/use-is-mac.ts';
import { cn } from '@/lib/utils.ts';
import { IconClose, IconMinus } from '@/assets/svg';
import { CommandLinkDialog } from '@/components/CommandLinkDialog.tsx';

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
      <div className="no-drag group flex items-center justify-start gap-2.5 pt-0.5">
        {!isMac && (
          <>
            {[
              { color: 'bg-red-400', action: () => window.windowsApi.close(), icon: IconClose },
              {
                color: 'bg-yellow-400',
                action: () => window.windowsApi.minimize(),
                icon: IconMinus,
              },
              {
                color: 'bg-green-500',
                action: () => window.windowsApi.maximize(),
                icon: Maximize2Icon,
              },
            ].map(({ color, action, icon: Icon }, i) => (
              <div
                key={i}
                className={cn(`flex h-3 w-3 items-center justify-center rounded-full`, color)}
                onClick={action}
              >
                <button className="invisible flex items-center justify-center text-black group-hover:visible">
                  <Icon className="h-2 w-2 stroke-2" />
                </button>
              </div>
            ))}
          </>
        )}
      </div>
      <div className={cn('no-drag flex items-center gap-2')}>
        <CommandLinkDialog />
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
