import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Play, Square, RefreshCw } from 'lucide-react';
import useSettingStore, { SCHEDULES, SCHEDULES_RULE } from '@/store/useSettingStore.ts';
import { format } from 'date-fns';
import useInitializeStores from '@/hooks/use-initialize-stores.tsx';

export function SchedulerControl() {
  const { data, updateIn } = useSettingStore();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { initOne } = useInitializeStores();

  useEffect(() => {
    loadStatus();

    // 이벤트 리스너
    const unsubscribeUpdated = window.schedulerApi.onChannelsUpdated((result) => {
      toast.success(`채널 데이터 업데이트 완료: ${result.count}/${result.total}개`);
      loadStatus();
      updateIn('scheduler', {
        ...data.scheduler,
        autoStart: false,
        updatedAt: new Date(),
      });
      initOne('channel');
    });

    const unsubscribeError = window.schedulerApi.onChannelsError((error) => {
      toast.error(`수집 실패: ${error.message}`);
    });

    const interval = setInterval(loadStatus, 10000);

    return () => {
      unsubscribeUpdated();
      unsubscribeError();
      clearInterval(interval);
    };
  }, [data.scheduler.rule]);

  const loadStatus = async () => {
    const status = await window.schedulerApi.getStatus();
    setStatus(status);
  };

  const handleStart = async () => {
    if (!data.youtube.apiKey) {
      toast.error('먼저 YouTube API Key를 설정하세요');
      return;
    }

    setLoading(true);
    const result = await window.schedulerApi.start(data.scheduler.rule);

    if (result.success) {
      toast.success('스케줄러 시작');
      loadStatus();
      // ✅ autoStart false로 저장
      await updateIn('scheduler', {
        ...data.scheduler,
        autoStart: true,
      });
    } else {
      toast.error(result.error || '시작 실패');
    }

    setLoading(false);
  };

  const handleStop = async () => {
    setLoading(true);
    const result = await window.schedulerApi.stop();

    if (result.success) {
      toast.success('스케줄러 중지');

      // ✅ autoStart false로 저장
      await updateIn('scheduler', {
        ...data.scheduler,
        autoStart: false,
      });

      loadStatus();
    }

    setLoading(false);
  };
  const handleRunNow = async () => {
    const txt = `마지막 갱신일: ${format(data.scheduler.updatedAt, 'yyyy-MM-dd hh:mm')}\n 정말 갱신하시겠습니까?`;
    if (!confirm(txt)) return;

    if (!data.youtube.apiKey) {
      toast.error('먼저 YouTube API Key를 설정하세요');
      return;
    }

    setLoading(true);
    toast.info('채널 데이터 수집 중...');
    try {
      const result = await window.schedulerApi.runNow();

      if (result.success) {
        toast.success(`수집 완료: ${result.count}/${result.total}개`);
        loadStatus();
        await updateIn('scheduler', {
          ...data.scheduler,
          autoStart: false,
          updatedAt: new Date(),
        });
        initOne('channel');
      } else {
        toast.error(result.message || '수집 실패');
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 스케줄러 컨트롤 */}
      <Card className="p-4">
        <h3 className="mb-3 font-bold">채널 데이터 자동 수집</h3>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={data.scheduler.rule}
              onValueChange={(v) =>
                updateIn('scheduler', { ...data.scheduler, rule: v as SCHEDULES_RULE })
              }
              disabled={status?.isEnabled || loading}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCHEDULES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {status?.isEnabled ? (
              <Button onClick={handleStop} variant="destructive" disabled={loading} size="sm">
                <Square className="mr-1 h-4 w-4" />
                중지
              </Button>
            ) : (
              <Button onClick={handleStart} disabled={loading || !data.youtube.apiKey} size="sm">
                <Play className="mr-1 h-4 w-4" />
                시작
              </Button>
            )}

            <Button
              onClick={handleRunNow}
              variant="secondary"
              disabled={loading || !data.youtube.apiKey}
              size="sm"
            >
              <RefreshCw className="mr-1 h-4 w-4" />
              지금 실행
            </Button>
          </div>
          {status && (
            <div className="space-y-2 border-t pt-3 text-sm">
              <div className="flex items-center gap-2">
                <span className={status?.isEnabled || loading ? 'text-green-500' : 'text-gray-400'}>
                  {status?.isEnabled || loading ? '🟢' : '⚪'}
                </span>
                <span>{status?.isEnabled || loading ? '실행 중' : '중지됨'}</span>
                {status?.isRunning && <span className="text-xs text-blue-500">수집 중...</span>}
              </div>

              <div className="border-t pt-2 text-xs">
                자동 시작: {data?.scheduler?.autoStart ? '✅ 켜짐' : '❌ 꺼짐'}
              </div>
              {format(data.scheduler.updatedAt, 'yyyy.MM.dd hh:mm')}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
