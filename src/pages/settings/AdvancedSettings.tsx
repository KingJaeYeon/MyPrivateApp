import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';
import useSettingStore from '@/store/useSettingStore';
import { useModalStore } from '@/store/modalStore.ts';

export function AdvancedSettings() {
  const { data, updateIn } = useSettingStore();
  const { openModal } = useModalStore();

  const handleReset = () => {
    if (confirm('모든 설정을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      // 초기화 로직
      openModal('alert', '설정이 초기화되었습니다');
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* 파일명 규칙 */}
      <Card>
        <CardHeader>
          <CardTitle>파일명 규칙</CardTitle>
          <CardDescription>저장되는 결과 파일의 이름 형식을 설정합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>타임스탬프 형식</Label>
            <Select
              value={data.folder.exportFile.fileStampMode}
              onValueChange={(value: 'date' | 'datetime') => {
                updateIn('folder', {
                  ...data.folder,
                  exportFile: { fileStampMode: value },
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">날짜 (2025-10-19)</SelectItem>
                <SelectItem value="datetime">날짜+시간 (2025-10-19 21:03)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-muted-foreground bg-muted rounded-lg p-3 text-xs">
            <p className="mb-1 font-medium">미리보기:</p>
            <p className="font-mono">
              {data.folder.exportFile.fileStampMode === 'date'
                ? '[2025-10-19] abc123.xlsx'
                : '[2025-10-19 21:03] abc123.xlsx'}
            </p>
          </div>
        </CardContent>
      </Card>

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
