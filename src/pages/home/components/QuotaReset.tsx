import { Button } from '@/components/ui/button.tsx';
import useSettingStore from '@/store/useSettingStore.ts';
import { isAfter, isSameDay, setHours, setMinutes, setSeconds } from 'date-fns';
import { useEffect, useState } from 'react';

export default function QuotaReset() {
  const {
    data: { youtube },
    updateIn,
  } = useSettingStore();

  const [over1Day, setOver1Day] = useState<boolean>();

  const isValid = () => {
    const curTime = new Date();
    const quotaTime = youtube.quotaUpdatedAt ? new Date(youtube.quotaUpdatedAt) : null;

    // 오늘 날짜 기준 4시(16:00) 생성
    const today4PM = setSeconds(setMinutes(setHours(curTime, 16), 0), 0);
    // 1️⃣ 현재 시간이 오늘 오후 4시 이후인지
    const isAfter4PM = isAfter(curTime, today4PM);
    // 2️⃣ quotaUpdatedAt이 오늘 오후 4시 이후에 갱신되었는지
    const isQuotaUpdatedAfter4PM =
      quotaTime !== null && isSameDay(curTime, quotaTime) && isAfter(quotaTime, today4PM);
    // 최종 판단 (오늘 4시 지남 + 아직 갱신 안됨)
    return isAfter4PM && !isQuotaUpdatedAfter4PM;
  };

  useEffect(() => {
    const shouldUpdateQuota = isValid();
    setOver1Day(shouldUpdateQuota);
  }, [youtube]);

  const onClick = async () => {
    const shouldUpdateQuota = isValid();

    if (!shouldUpdateQuota) {
      alert('오후 4:00 이후에 클릭해주세요.');
      return;
    }

    if (confirm('초기화 하시겠습니까?')) {
      await updateIn('youtube', {
        usedQuota: 0,
        apiKey: youtube.apiKey,
        quotaUpdatedAt: new Date().toLocaleString(),
      });
      setOver1Day(false);
    }
  };

  return (
    <Button
      className={'flex w-full flex-1 rounded-none border'}
      variant={over1Day ? 'destructive' : 'secondary'}
      onClick={onClick}
    >
      쿼터({youtube.usedQuota})
    </Button>
  );
}
