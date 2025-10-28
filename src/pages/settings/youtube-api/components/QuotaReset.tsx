import { Button } from '@/components/ui/button.tsx';
import useSettingStore from '@/store/useSettingStore.ts';
import { isAfter, parse, setHours, setMinutes, setSeconds, startOfDay } from 'date-fns';
import { useEffect, useState } from 'react';
import { ko } from 'date-fns/locale';
import { useModalStore } from '@/store/modalStore.ts';

export default function QuotaReset() {
  const {
    data: { youtube },
    updateIn,
  } = useSettingStore();
  const { openModal } = useModalStore();
  const [canReset, setCanReset] = useState(false);

  // ✅ 초기화 가능 여부 판단 로직 분리
  const checkCanReset = (): boolean => {
    const now = new Date();
    const quotaUpdatedAt = youtube.quotaUpdatedAt;

    // quotaUpdatedAt이 없으면 초기화 가능
    if (!quotaUpdatedAt) return true;

    try {
      const lastResetTime = parse(quotaUpdatedAt, 'yyyy. MM. dd. a h:mm:ss', new Date(), {
        locale: ko,
      });

      // 오늘 오후 4시 (PST 자정 = KST 오후 4시)
      const todayReset = setSeconds(setMinutes(setHours(startOfDay(now), 16), 0), 0);

      // 현재 시간이 오늘 오후 4시 이전이면 초기화 불가
      if (!isAfter(now, todayReset)) {
        return false;
      }

      // 마지막 초기화가 오늘 오후 4시 이후라면 이미 초기화됨
      if (isAfter(lastResetTime, todayReset)) {
        return false;
      }

      // 오후 4시 지났고, 아직 초기화 안 했으면 가능
      return true;
    } catch (error) {
      console.error('날짜 파싱 오류:', error);
      return true; // 파싱 실패 시 초기화 허용
    }
  };

  useEffect(() => {
    setCanReset(checkCanReset());
  }, [youtube.quotaUpdatedAt]);

  const handleReset = async () => {
    if (!checkCanReset()) {
      openModal('alert', '할당량 초기화는 오후 4:00 이후에 가능합니다.');
      return;
    }

    if (!confirm('할당량을 초기화하시겠습니까?')) {
      return;
    }

    await updateIn('youtube', {
      ...youtube,
      usedQuota: 0,
      quotaUpdatedAt: new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }),
    });

    setCanReset(false);
  };

  return (
    <Button variant={canReset ? 'destructive' : 'outline'} onClick={handleReset} size="sm">
      할당량 초기화
    </Button>
  );
}
