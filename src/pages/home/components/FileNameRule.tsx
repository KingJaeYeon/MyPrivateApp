import { Label } from '@/components/ui/label.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useEffect, useState } from 'react';
import useSettingStore, { State } from '@/store/useSettingStore.ts';
import { Button } from '@/components/ui/button.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { cn } from '@/lib/utils.ts';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function FileNameRule() {
  const [editValues, setEditValues] = useState<State['data']['folder']['name']>();
  const [editFileDate, setEditFileDate] = useState<'date' | 'datetime'>();
  const { location, name: names, exportFile } = useSettingStore((r) => r.data.folder);
  const { updateIn } = useSettingStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setEditValues(names);
    setEditFileDate(exportFile.fileStampMode);
  }, [names]);

  function editHandler(key: keyof State['data']['folder']['name'], value: string) {
    setEditValues((prev) => {
      if (!prev) return prev; // prev가 undefined면 그대로 반환
      return {
        ...prev,
        [key]: value,
      };
    });
  }

  async function UpdateHandler() {
    const isAllFill =
      !!editValues?.channel &&
      !!editValues?.tag &&
      !!editValues?.progress &&
      !!editValues?.english &&
      !!editValues?.prompt &&
      !!editValues?.reference &&
      !!editValues?.result &&
      !!editValues.channelHistory &&
      !!editFileDate;

    if (!isAllFill) {
      alert('FileName Rule 먼저 체워 주세요.');
      return;
    }

    const { result, ...others } = editValues;
    const files = Object.values(others);
    const allXlsx = files.every((f) => /\.xlsx?$/.test(f.toLowerCase()));
    const resultCheck = /^\//.test(result) || /\./.test(result);
    if (!allXlsx) {
      alert('result를 제외한 모든 파일명이 .xlsx, .xls 확장자를 가져야 합니다.');
      return;
    }
    if (resultCheck) {
      alert('result는 맨앞에 /와 . 제외해야합니다.');
      return;
    }

    await updateIn('folder', {
      name: editValues,
      location,
      exportFile: {
        fileStampMode: editFileDate,
      },
    });
    alert('저장되었습니다.');
  }

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
        <Button className={'flex w-full flex-1 rounded-none border'} variant={'secondary'}>
          FileName Rule
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className={'min-w-[700px]'}>
        <AlertDialogHeader>
          <AlertDialogTitle>FileName Rule</AlertDialogTitle>
          <div className={'mb-3 flex'}>
            <div className={'flex items-center gap-1 text-xs'}>
              <div className={'h-2.5 w-2.5 rounded-full bg-green-600'} />
              File
            </div>
            <div className={'mx-2 border-r'}></div>
            <div className={'flex gap-3'}>
              <div className={'flex items-center gap-1 text-xs'}>
                <div className={'bg-destructive h-2.5 w-2.5 rounded-full'} />
                <span>Folder</span>
              </div>
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
          </div>
          <div className="mb-4 grid w-full grid-cols-2 items-center gap-x-4 gap-y-3">
            <div className={'flex flex-col gap-1'}>
              <Label htmlFor="mode" className={'text-xs text-green-500'}>
                TAGS
              </Label>
              <Input
                className={cn(names.tag !== editValues?.tag && 'border-green-600')}
                onChange={(e) => editHandler('tag', e.target.value)}
                value={editValues?.tag}
              />
            </div>
            <div className={'flex flex-col gap-1'}>
              <Label htmlFor="mode" className={'text-xs text-green-500'}>
                CHANNEL
              </Label>
              <Input
                className={cn(names.channel !== editValues?.channel && 'text-green-600')}
                onChange={(e) => editHandler('channel', e.target.value)}
                value={editValues?.channel}
              />
            </div>
            <div className={'flex flex-col gap-1'}>
              <Label htmlFor="mode" className={'text-xs text-green-500'}>
                CHANNEL HISTORY
              </Label>
              <Input
                className={cn(
                  names.channelHistory !== editValues?.channelHistory && 'text-green-600'
                )}
                onChange={(e) => editHandler('channelHistory', e.target.value)}
                value={editValues?.channelHistory}
              />
            </div>
            <div className={'flex flex-col gap-1'}>
              <Label htmlFor="mode" className={'text-xs text-green-500'}>
                PROMPT
              </Label>
              <Input
                className={cn(names.prompt !== editValues?.prompt && 'text-green-600')}
                onChange={(e) => editHandler('prompt', e.target.value)}
                value={editValues?.prompt}
              />
            </div>
            <div className={'flex flex-col gap-1'}>
              <Label htmlFor="mode" className={'text-destructive text-xs'}>
                RESULT
              </Label>
              <Input
                className={cn(names.result !== editValues?.result && 'border-destructive')}
                onChange={(e) => editHandler('result', e.target.value)}
                value={editValues?.result}
              />
            </div>
            <div className={'flex flex-col gap-1'}>
              <Label htmlFor="mode" className={'text-xs text-green-500'}>
                REFERENCE
              </Label>
              <Input
                className={cn(names.reference !== editValues?.reference && 'text-green-600')}
                onChange={(e) => editHandler('reference', e.target.value)}
                value={editValues?.reference}
              />
            </div>
            <div className={'flex flex-col gap-1'}>
              <Label htmlFor="mode" className={'text-xs text-green-500'}>
                ENGLISH
              </Label>
              <Input
                className={cn(names.english !== editValues?.english && 'text-green-600')}
                onChange={(e) => editHandler('english', e.target.value)}
                value={editValues?.english}
              />
            </div>
            <div className={'flex flex-col gap-1'}>
              <Label htmlFor="mode" className={'text-xs text-green-500'}>
                PROGRESS
              </Label>
              <Input
                className={cn(names.progress !== editValues?.progress && 'text-green-600')}
                onChange={(e) => editHandler('progress', e.target.value)}
                value={editValues?.progress}
              />
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <Button onClick={UpdateHandler}>저장</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
