import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Key, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import useSettingStore from '@/store/useSettingStore';

export function YouTubeAPISettings() {
  const { data, updateIn } = useSettingStore();
  const [apiKey, setApiKey] = useState(data.youtube.apiKey);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await updateIn('youtube', { ...data.youtube, apiKey });
    setIsSaving(false);
  };

  const quotaPercentage = (data.youtube.usedQuota / 10000) * 100;

  return (
    <div className="max-w-2xl space-y-6">
      {/* API Key 입력 */}
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
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="flex gap-2">
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSyDDe44x6EkzF2V0QOD1gecv929QSjD0dS4"
                className="font-mono text-sm"
              />
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? '저장 중...' : '저장'}
              </Button>
            </div>
            {apiKey && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>API Key가 설정되었습니다</span>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener
            noreferrer" className="text-sm text-blue-600 hover:underline"
            <a>→ Google Cloud Console에서 API Key 발급받기</a>
          </div>
        </CardContent>
      </Card>

      {/* 할당량 모니터링 */}
      <Card>
        <CardHeader>
          <CardTitle>할당량 사용량</CardTitle>
          <CardDescription>일일 10,000 units 제한</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
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

      {/* API 작업 비용 안내 */}
      <Card>
        <CardHeader>
          <CardTitle>주요 API 작업 비용</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">채널 정보 조회</span>
              <Badge variant="secondary">1 unit</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">영상 검색 (50개)</span>
              <Badge variant="secondary">100 units</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">영상 상세 정보 (50개)</span>
              <Badge variant="secondary">1 unit</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
