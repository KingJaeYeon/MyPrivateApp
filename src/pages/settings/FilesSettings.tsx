import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FolderOpen, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import useSettingStore from '@/store/useSettingStore';

export function FilesSettings() {
  const { data, updateIn } = useSettingStore();

  const handlePickFolder = async () => {
    const path = await window.electronAPI.pickFolder();
    if (path) {
      await updateIn('folder', { ...data.folder, location: path });
    }
  };

  const handleCreateExcel = async () => {
    if (!data.folder.location) {
      alert('폴더를 먼저 선택하세요');
      return;
    }
    // Excel 생성 로직
    alert('Excel 파일이 생성되었습니다');
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* 폴더 선택 */}
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
                value={data.folder.location || '폴더를 선택하세요'}
                readOnly
                className="font-mono text-sm"
              />
              <Button onClick={handlePickFolder}>폴더 선택</Button>
            </div>
            {data.folder.location && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>폴더가 설정되었습니다</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Excel 파일 생성 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            <CardTitle>Excel 파일 관리</CardTitle>
          </div>
          <CardDescription>필요한 Excel 파일을 생성하거나 관리합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleCreateExcel} disabled={!data.folder.location} className="w-full">
            Excel 파일 생성
          </Button>

          <div className="text-muted-foreground bg-muted rounded-lg p-3 text-xs">
            <p className="mb-2 font-medium">생성될 파일:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>channels.xlsx - 채널 정보</li>
              <li>tags.xlsx - 태그 목록</li>
              <li>prompts.xlsx - 프롬프트 저장</li>
              <li>references.xlsx - 참고 자료</li>
              <li>channels-history.xlsx - 채널 히스토리</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
