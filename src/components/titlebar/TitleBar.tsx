import ThemeToggle from '@/components/titlebar/ThemeToggle.tsx';
import { ScheduleController } from '@/components/titlebar/ScheduleController.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Wifi } from 'lucide-react';
import useSettingStore from '@/store/useSettingStore.ts';
import { Youtube } from '@/assets/svg';
import MemoryBadge from '@/components/titlebar/MemoryBadge.tsx';

export default function TitleBar() {
  const hasApiKey = useSettingStore((s) => !!s.data.youtube.apiKey);
  return (
    <div className="drag bg-background flex h-[36px] w-full items-center justify-between border-b px-3 pl-[80px]">
      {/* 왼쪽: 브랜딩 + 상태 */}
      <div className="flex items-center gap-3">
        {/* 앱 로고/이름 */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-red-500 to-red-600">
              <Youtube className="h-3 w-3 text-white" />
            </div>
            {hasApiKey && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </span>
            )}
          </div>
          <span className="text-sm font-semibold">YouTube Searcher</span>
        </div>

        {/* API 상태 배지 (선택사항) */}
        {hasApiKey && (
          <Badge variant="secondary" className="h-5 gap-1 text-[10px] font-normal">
            <Wifi className="h-2.5 w-2.5" />
            API 연결됨
          </Badge>
        )}
      </div>

      {/* 오른쪽: 컨트롤들 */}
      <div className="no-drag flex items-center gap-2">
        <MemoryBadge />
        <ScheduleController />
        <div className="bg-border h-4 w-px" />
        <ThemeToggle />
      </div>
    </div>
  );
}
