import { Label } from '@/components/ui/label.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useEffect, useState } from 'react';
import useSettingStore, { State } from '@/store/useSettingStore.ts';
import { Button } from '@/components/ui/button.tsx';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog.tsx';
import { FileText, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils.ts';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { toast } from 'sonner';

export function FileNameRuleModal() {
  const [editValues, setEditValues] = useState<State['data']['folder']['name']>();
  const [editFileDate, setEditFileDate] = useState<'date' | 'datetime'>();
  const { location, name: names, exportFile } = useSettingStore((r) => r.data.folder);
  const { updateIn } = useSettingStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setEditValues(names);
    setEditFileDate(exportFile.fileStampMode);
  }, [names, exportFile.fileStampMode]);

  function editHandler(key: keyof State['data']['folder']['name'], value: string) {
    setEditValues((prev) => {
      if (!prev) return prev;
      return { ...prev, [key]: value };
    });
  }

  async function UpdateHandler() {
    const isAllFill =
      !!editValues?.channel &&
      !!editValues?.tag &&
      !!editValues?.progress &&
      !!editValues?.verbs &&
      !!editValues?.patterns &&
      !!editValues?.concepts &&
      !!editValues?.expressions &&
      !!editValues?.prompt &&
      !!editValues?.reference &&
      !!editValues?.result &&
      !!editValues.channelHistory &&
      !!editFileDate;

    if (!isAllFill) {
      toast.success('모든 필드를 입력해주세요.');
      return;
    }

    const { result, ...others } = editValues;
    const files = Object.values(others);
    const allXlsx = files.every((f) => /\.xlsx?$/i.test(f));
    const resultCheck = /^\//.test(result) || /\./.test(result);

    if (!allXlsx) {
      toast.error('Result를 제외한 모든 파일은 .xlsx 확장자가 필요합니다.');
      return;
    }
    if (resultCheck) {
      toast.error('Result는 /와 .로 시작할 수 없습니다.');
      return;
    }

    await updateIn('folder', {
      name: editValues,
      location,
      exportFile: { fileStampMode: editFileDate },
    });

    setOpen(false);
    toast.success('저장되었습니다.');
  }

  // 파일 그룹
  const fileConfigs = [
    { key: 'tag' as const, label: 'Tags', icon: FileText },
    { key: 'channel' as const, label: 'Channels', icon: FileText },
    { key: 'channelHistory' as const, label: 'Channel History', icon: FileText },
    { key: 'prompt' as const, label: 'Prompts', icon: FileText },
    { key: 'reference' as const, label: 'References', icon: FileText },
    { key: 'verbs' as const, label: 'Verbs', icon: FileText },
    { key: 'patterns' as const, label: 'Patterns', icon: FileText },
    { key: 'concepts' as const, label: 'Concepts', icon: FileText },
    { key: 'expressions' as const, label: 'Expressions', icon: FileText },
    { key: 'progress' as const, label: 'Progress', icon: FileText },
  ];

  return (
    <AlertDialog
      open={open}
      onOpenChange={(open) => {
        if (open) {
          setEditValues(names);
          setEditFileDate(exportFile.fileStampMode);
        }
        setOpen(open);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="secondary" className="w-full">
          파일명 설정
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="flex max-h-[90vh] max-w-3xl flex-col overflow-hidden">
        <AlertDialogHeader>
          <AlertDialogTitle className={'text-lg'}>파일명 규칙 설정</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-green-600" />
            <Label className="text-sm font-semibold">파일 이름</Label>
            <span className="text-muted-foreground text-xs">(.xlsx 필수)</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {fileConfigs.map(({ key, label }) => {
              const isChanged = names[key] !== editValues?.[key];
              return (
                <div key={key} className="space-y-1.5">
                  <Label htmlFor={key} className="text-muted-foreground text-xs">
                    {label}
                  </Label>
                  <Input
                    id={key}
                    value={editValues?.[key] || ''}
                    onChange={(e) => editHandler(key, e.target.value)}
                    placeholder={`${label.toLowerCase()}.xlsx`}
                    className={cn('font-mono text-xs', isChanged && 'border-green-600')}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-7 space-y-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-red-600" />
            <Label className="text-sm font-semibold">검색 결과 폴더</Label>
            <span className="text-muted-foreground text-xs">(/, . 로 시작 불가)</span>
            <div className={'flex items-center gap-2 text-xs'}>
              <div className={'flex gap-1'}>
                <Checkbox
                  checked={editFileDate === 'date'}
                  onCheckedChange={(_) => setEditFileDate('date')}
                />
                <span>날짜 [yyyy-MM-dd]</span>
              </div>
              <div className={'flex gap-1'}>
                <Checkbox
                  checked={editFileDate === 'datetime'}
                  onCheckedChange={(_) => setEditFileDate('datetime')}
                />
                <span>시간 [yyyy-MM-dd HH:mm]</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="result" className="text-muted-foreground text-xs">
              Result Folder
            </Label>
            <Input
              id="result"
              value={editValues?.result || ''}
              onChange={(e) => editHandler('result', e.target.value)}
              placeholder="result"
              className={cn(
                'font-mono text-xs',
                names.result !== editValues?.result && 'border-red-600'
              )}
            />
            <p className="text-muted-foreground text-xs">
              검색 결과 파일이 이 폴더 안에 저장됩니다
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <Button onClick={UpdateHandler}>저장</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
