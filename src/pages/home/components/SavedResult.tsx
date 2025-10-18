import useSettingStore from '@/store/useSettingStore.ts';
import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label.tsx';
import { Button } from '@/components/ui/button.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { cn } from '@/lib/utils.ts';

export function SavedResult() {
  const { name, location } = useSettingStore((r) => r.data.folder);
  const [savedFiles, setSavedFiles] = useState<string[]>([]);
  const [select, setSelect] = useState<string>('');

  async function getFiles() {
    const result = await window.fsApi.listExcel(`${location}/${name.result.split('/')[0]}`);
    setSavedFiles(result);
  }

  useEffect(() => {
    if (location) {
      getFiles();
    }
  }, [location]);

  return (
    <div className={'flex w-full max-w-[1000px] flex-col gap-4'}>
      <div className={'flex min-w-fit justify-between'}>
        <Label htmlFor="mode" className="min-w-[100px]">
          Saved Result
        </Label>
        <Button size={'sm'} onClick={getFiles}>
          새로고침
        </Button>
      </div>
      <div className={'flex h-80 gap-4'}>
        <ScrollArea className="h-full w-60 rounded-md border">
          <div className="p-4">
            {savedFiles.map((fileName) => {
              const display = fileName.split('cid');
              const values = display[1].split('_');
              return (
                <React.Fragment key={fileName}>
                  <div
                    className={cn(
                      'cursor-pointer text-sm',
                      fileName === select && 'text-destructive'
                    )}
                    onClick={() => setSelect(fileName)}
                  >
                    {`${display[0]} ${values[1]}`}
                  </div>
                  <Separator className="my-2" />
                </React.Fragment>
              );
            })}
          </div>
        </ScrollArea>
        <div className={'h-full flex-1 rounded-md border border-red-500'}>
          {JSON.stringify(select)}
        </div>
      </div>
    </div>
  );
}
