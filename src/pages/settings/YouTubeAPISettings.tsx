import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Key } from 'lucide-react';
import { useState } from 'react';
import useSettingStore from '@/store/useSettingStore';
import Tip from '@/components/Tip.tsx';
import IconMoreInfo from '@/assets/svg/IconMoreInfo.tsx';
import {
  CancelButton,
  ConnectButton,
  DeleteButton,
  EditButton,
} from '@/pages/home/components/api-buttons.tsx';
import { ApiType } from '@/pages/home/Home.tsx';

export function YouTubeAPISettings() {
  const { data, updateIn } = useSettingStore();
  const [apiKey, setApiKey] = useState('');
  const hasApiKey = Boolean(data.youtube.apiKey);
  const [editing, setEditing] = useState(false);

  const youtubeApiKey = useSettingStore((r) => r.data.youtube.apiKey);
  const [editValues, setEditValues] = useState({ youtubeApiKey: '' });
  const [isEditing, setIsEditing] = useState({ youtubeApiKey: false });

  const getValue = () => {
    if (hasApiKey && !editing) {
      return data.youtube.apiKey;
    }
    return apiKey;
  };

  const ConnectionStatus = ({ isConnect }: { isConnect: boolean }) => {
    if (isConnect && !editing) {
      return (
        <div className="flex gap-2">
          <EditButton setEditing={setEditing} setApiKey={setApiKey} />
          <DeleteButton />
        </div>
      );
    }

    if (isConnect && editing) {
      return (
        <div className="flex gap-2">
          <ConnectButton editValues={editValues} setIsEditing={setEditing} />
          <CancelButton setIsEditing={setIsEditing} setEditValues={setEditValues} />
        </div>
      );
    }

    return <ConnectButton editValues={editValues} setIsEditing={setIsEditing} />;
  };

  const quotaPercentage = (data.youtube.usedQuota / 10000) * 100;

  return (
    <div className="flex h-full w-[750px] flex-1 flex-col gap-5 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <CardTitle>YouTube Data API v3</CardTitle>
          </div>
          <CardDescription>
            YouTube 채널 및 영상 정보를 가져오기 위한 API Key를 설정하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="flex gap-2">
              <Input
                id="apiKey"
                readOnly={Boolean(youtubeApiKey) && !isEditing['youtubeApiKey']}
                value={getValue()}
                type="password"
                placeholder="AIzaSyDDe44x6EkzF2V0QOD1gecv929QSjD0dS4"
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono text-sm"
              />
              <ConnectionStatus isConnect={hasApiKey} />
            </div>
            {apiKey && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>API Key가 설정되었습니다</span>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <p
              onClick={() =>
                window.electronAPI.openExternal('https://console.cloud.google.com/apis/credentials')
              }
              className="inline cursor-pointer text-sm text-blue-600 hover:underline"
            >
              → Google Cloud Console에서 API Key 발급받기
            </p>
          </div>
        </CardContent>
      </Card>

      {/*/!* 할당량 모니터링 *!/*/}
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
                {data.youtube.usedQuota.toLocaleString()} / 10,000 units
              </span>
            </div>

            {/* 진행 바 */}
            <div className="bg-secondary relative h-2 overflow-hidden rounded-full">
              <div
                className="absolute h-full bg-blue-600 transition-all"
                style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
              />
            </div>

            {quotaPercentage >= 90 && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-600 dark:bg-amber-950">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-medium">할당량 부족 경고</p>
                  <p className="mt-1 text-xs">
                    할당량의 {quotaPercentage.toFixed(0)}%를 사용했습니다. 자정(PST)에 초기화됩니다.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateIn('youtube', { ...data.youtube, usedQuota: 0 });
              }}
            >
              할당량 수동 초기화
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
