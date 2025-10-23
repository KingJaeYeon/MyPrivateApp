import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import useSettingStore from '@/store/useSettingStore.ts';
import useInitializeStores from '@/hooks/use-initialize-stores.tsx';

export default function useChannelsSchedule() {
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
    if (data.scheduler.updatedAt) {
      const txt = `마지막 갱신: ${format(data.scheduler.updatedAt, 'yyyy-MM-dd HH:mm')}\n현재시간: ${format(new Date(), 'yyyy-MM-dd HH:mm')}\n정말 갱신하시겠습니까?`;
      if (!confirm(txt)) return;
    }

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

  return { status, loading, handleStart, handleRunNow, handleStop };
}
