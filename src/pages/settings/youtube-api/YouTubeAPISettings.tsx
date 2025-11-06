import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';

import { AlertCircle } from 'lucide-react';
import useSettingStore from '@/store/useSettingStore.ts';
import Tip from '@/components/Tip.tsx';
import IconMoreInfo from '@/assets/svg/IconMoreInfo.tsx';
import APISettings from '@/pages/settings/youtube-api/components/APISettings.tsx';
import QuotaReset from '@/pages/settings/youtube-api/components/QuotaReset.tsx';

export function YouTubeAPISettings() {
  return (
    <div className="flex h-full w-[750px] flex-1 flex-col gap-5 px-4">
      <APISettings />
      <UsedQuotaDisplay />
      {/*/!* 할당량 모니터링 *!/*/}
    </div>
  );
}

function UsedQuotaDisplay() {
  const quota = useSettingStore((r) => r.data.youtube);

  const quotaPercentage = (quota.usedQuota / 10000) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className={'flex gap-2'}>
          할당량 사용량
          <Tip
            txt={`주요 API 작업 비용\n• 채널 정보 조회 1 unit\n• 영상 검색 - 키워드 (50개) 100 unit\n• 영상 검색 - 채널 (50개) 1 unit\n• 영상 상세 정보 (50개) 1 unit`}
          >
            <IconMoreInfo />
          </Tip>
        </CardTitle>
        <CardDescription>일일 10,000 units 제한</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">사용량</span>
            <span className="font-mono font-medium">
              {quota.usedQuota.toLocaleString()} / 10,000 units
            </span>
          </div>

          {/* 진행 바 */}
          <div className="bg-secondary relative h-2 overflow-hidden rounded-full">
            <div
              className="absolute h-full bg-blue-600 transition-all"
              style={{ width: `${Math.min(quota.usedQuota / 100, 100)}%` }}
            />
          </div>

          {quotaPercentage >= 90 && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-600 dark:bg-amber-950">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div>
                <p className="font-medium">할당량 부족 경고</p>
                <p className="mt-1 text-xs">
                  할당량의 {quotaPercentage.toFixed(0)}%를 사용했습니다. 오후 4시에 초기화됩니다.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <QuotaReset />
        </div>
      </CardContent>
    </Card>
  );
}
