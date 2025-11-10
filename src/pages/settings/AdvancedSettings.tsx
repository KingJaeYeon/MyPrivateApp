import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import useSettingStore from '@/store/useSettingStore';
import { useModalStore } from '@/store/modalStore.ts';
import { useVideoSearchStore } from '@/store/useVideoSearchStore.ts';

export default function AdvancedSettings() {
  const { reset } = useSettingStore();
  const { openModal } = useModalStore();
  const { resetFilter, clearResult, clearErrors } = useVideoSearchStore();

  const handleReset = () => {
    if (!confirm('모든 설정을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    try {
      reset();
      resetFilter();
      clearResult();
      clearErrors();
      openModal('alert', '설정이 초기화되었습니다');
    } catch (e) {}
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* 위험한 작업 */}
      <Card className="border-destructive">
        <CardHeader>
          <div className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle>위험 영역</CardTitle>
          </div>
          <CardDescription>신중하게 사용하세요. 되돌릴 수 없습니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="destructive" onClick={handleReset} className="w-full">
            모든 설정 초기화
          </Button>

          <p className="text-muted-foreground text-xs">
            • YouTube API Key 제거
            <br />
            • 폴더 경로 초기화
            <br />
            • 할당량 초기화
            <br />• 모든 사용자 설정 제거
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
