import useSettingStore from '@/store/useSettingStore.ts';
import useChannelsSchedule from '@/hooks/use-channels-schedule.ts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';
import { CheckCircle2, FolderOpen } from 'lucide-react';
import { Label } from '@/components/ui/label.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';

export function LocationSetting() {
  const {
    data: { folder },
    updateIn,
  } = useSettingStore();
  const { handleStop } = useChannelsSchedule();

  const handlePickFolder = async () => {
    const path = await window.electronAPI.pickFolder();
    if (path) {
      await updateIn('folder', { ...folder, location: path });
    }
    handleStop();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          <CardTitle>작업 폴더</CardTitle>
        </div>
        <CardDescription>Excel 파일이 저장될 폴더를 선택하세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>폴더 경로</Label>
          <div className="flex gap-2">
            <Input
              value={folder.location || '폴더를 선택하세요'}
              readOnly
              onClick={handlePickFolder}
              className="font-mono text-sm"
            />
            <div className={'flex gap-2'}>
              <Button onClick={handlePickFolder}>{folder.location !== '' ? '변경' : '선택'}</Button>
              <Button
                variant={'secondary'}
                size={'icon'}
                onClick={() => window.electronAPI.openFolder(folder.location)}
              >
                <FolderOpen />
              </Button>
            </div>
          </div>
          {folder.location && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>폴더가 설정되었습니다</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
