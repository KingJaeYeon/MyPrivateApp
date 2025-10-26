import ThemeToggle from '@/components/titlebar/ThemeToggle.tsx';
import { ScheduleController } from '@/components/titlebar/ScheduleController.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Wifi } from 'lucide-react';
import useSettingStore from '@/store/useSettingStore.ts';
import MemoryBadge from '@/components/titlebar/MemoryBadge.tsx';

export default function TitleBar() {
  const hasApiKey = useSettingStore((s) => !!s.data.youtube.apiKey);
  return (
    <div className="drag bg-background flex h-[36px] w-full items-center justify-end border-b px-3 pl-[80px]">
      {/* 오른쪽: 컨트롤들 */}
      <div className="no-drag flex items-center gap-2">
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
