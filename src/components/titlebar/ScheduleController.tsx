import { useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import { Calendar, Clock, Play, RefreshCw, Square } from 'lucide-react';
import useSettingStore, { SCHEDULES, SCHEDULES_RULE } from '@/store/useSettingStore.ts';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator.tsx';
import { cn } from '@/lib/utils.ts';
import { Badge } from '@/components/ui/badge.tsx';
import useChannelsSchedule from '@/hooks/use-channels-schedule.ts';

export function ScheduleController() {
  const { status, handleStart, handleStop, handleRunNow, loading } = useChannelsSchedule();
  const { data, updateIn } = useSettingStore();
  const [open, setOpen] = useState(false);

  // 상태별 스타일
  const getStatusConfig = () => {
    if (loading || status?.isRunning) {
      return {
        dot: 'bg-blue-500 animate-pulse',
        text: '수집 중',
        textColor: 'text-blue-600',
      };
    }
    if (status?.isEnabled) {
      return {
        dot: 'bg-green-500 animate-pulse',
        text: '활성',
        textColor: 'text-green-600',
      };
    }
    return {
      dot: 'bg-gray-400',
      text: '중지',
      textColor: 'text-muted-foreground',
    };
  };

  const statusConfig = getStatusConfig();

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        if (!data.youtube.apiKey) {
          alert('YouTube API Key 필요');
          return;
        }
        if (!data.hasFile) {
          alert('Excel 생성 필요');
          return;
        }

        setOpen(open);
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="hover:bg-accent/50 h-7 gap-1.5 px-2 text-xs">
          <Clock className="h-3.5 w-3.5" />
          <span className={cn('h-1.5 w-1.5 rounded-full', statusConfig.dot)} />
          <span className={statusConfig.textColor}>{statusConfig.text}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0" align="end" sideOffset={8}>
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">채널 자동 수집</h3>
              <p className="mt-0.5 text-xs opacity-90">YouTube 채널 데이터를 주기적으로 업데이트</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4">
          {/* 현재 상태 */}
          <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className={cn('h-2 w-2 rounded-full', statusConfig.dot)} />
              <span className="text-sm font-medium">현재 상태</span>
            </div>
            <span className={cn('text-sm font-medium', statusConfig.textColor)}>
              {statusConfig.text}
            </span>
          </div>

          {/* 스케줄 설정 */}
          <div className="flex flex-col space-y-2">
            <label className="text-muted-foreground text-xs font-medium">수집 주기</label>
            <Select
              value={data.scheduler.rule}
              onValueChange={(v) =>
                updateIn('scheduler', { ...data.scheduler, rule: v as SCHEDULES_RULE })
              }
              disabled={status?.isEnabled || loading}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCHEDULES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      {s.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* 액션 버튼 */}
          <div className="grid gap-2">
            {status?.isEnabled ? (
              <Button onClick={handleStop} variant="destructive" disabled={loading} size="sm">
                <Square className="mr-2 h-3.5 w-3.5" />
                스케줄러 중지
              </Button>
            ) : (
              <Button onClick={handleStart} disabled={loading || !data.youtube.apiKey} size="sm">
                <Play className="mr-2 h-3.5 w-3.5" />
                스케줄러 시작
              </Button>
            )}

            <Button
              onClick={handleRunNow}
              variant="secondary"
              disabled={loading || !data.youtube.apiKey}
              size="sm"
            >
              <RefreshCw className={cn('mr-2 h-3.5 w-3.5', loading && 'animate-spin')} />
              지금 즉시 실행
            </Button>
          </div>

          <Separator />

          {/* 상세 정보 */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">앱 시작 시 자동 실행</span>
              <Badge
                variant={data.scheduler.autoStart ? 'default' : 'secondary'}
                className="text-[10px]"
              >
                {data.scheduler.autoStart ? '활성화' : '비활성화'}
              </Badge>
            </div>

            {data.scheduler.updatedAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">마지막 갱신</span>
                <span className="font-mono text-[11px] font-medium">
                  {format(new Date(data.scheduler.updatedAt), 'yyyy.MM.dd HH:mm')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 푸터 */}
        <div className="bg-muted/30 border-t px-4 py-2">
          <p className="text-muted-foreground text-center text-[10px]">
            YouTube Data API v3 • 할당량 주의
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
