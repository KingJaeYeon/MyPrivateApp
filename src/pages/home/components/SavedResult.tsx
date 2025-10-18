import useSettingStore from '@/store/useSettingStore.ts';
import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label.tsx';
import { Button } from '@/components/ui/button.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { cn } from '@/lib/utils.ts';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { IconFolder } from '@/assets/svg';
import { ArrowUpRightIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
// import { IconFolder } from '@/assets/svg';

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
            {savedFiles.map((fileName, i) => {
              const display = fileName.split('cid');
              const values = display[1].split('_');
              return (
                <React.Fragment key={i}>
                  <div
                    className={cn(
                      'cursor-pointer font-mono text-sm',
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
        <DetailOption select={select} cancel={() => setSelect('')} />
      </div>
    </div>
  );
}

function DetailOption({ select, cancel }: { select: string; cancel: () => void }) {
  if (!select) {
    return <EmmtyCard />;
  }

  const [date, rest] = select?.split('cid');
  const [_, __, ...data] = rest.split('_');
  return (
    <section className="h-full flex-1 rounded-md border p-4">
      <div className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{date}</h2>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => console.log('')}>
              상세
            </Button>
            <Button size="sm" variant="secondary" onClick={cancel}>
              취소
            </Button>
            <Button size="sm" variant="destructive" onClick={() => console.log('')}>
              삭제
            </Button>
          </div>
        </header>

        <code className="block rounded-lg bg-black/40 p-4 text-sm break-all">
          {'active.filename'}
          {JSON.stringify(data)}
        </code>

        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-neutral-400">Mode</dt>
            <dd className="font-mono">{'active.cid'}</dd>
          </div>
          <div>
            <dt className="text-neutral-400">Rows</dt>
            <dd>{'active.rows'}</dd>
          </div>
          <div>
            <dt className="text-neutral-400">Saved at</dt>
            <dd>{'active.savedAt'}</dd>
          </div>
          <div>
            <dt className="text-neutral-400">Size</dt>
            <dd>{'active.size'}</dd>
          </div>
        </dl>
      </div>
    </section>
    // <div className={'h-full flex-1 rounded-md border border-red-500 p-4'}>
    //   <p className={'text-xl'}>{date[0]}</p>
    //   {JSON.stringify(select)}
    // </div>
  );
}

function EmmtyCard() {
  return (
    <div className={'h-full flex-1 rounded-md border p-4'}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconFolder />
          </EmptyMedia>
          <EmptyTitle>No Result Files Yet</EmptyTitle>
          <EmptyDescription>
            You haven&apos;t selected any files yet. Please select one from the left panel.
          </EmptyDescription>
        </EmptyHeader>

        <Button variant="link" className="text-muted-foreground" size="sm">
          <Link to="/search-videos" className={'flex gap-2'}>
            Search Video
            <ArrowUpRightIcon />
          </Link>
        </Button>
      </Empty>
    </div>
  );
}
