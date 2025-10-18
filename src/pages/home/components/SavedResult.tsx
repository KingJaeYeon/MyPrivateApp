import useSettingStore from '@/store/useSettingStore.ts';
import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label.tsx';
import { Button } from '@/components/ui/button.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { cn, parsedExcelFileName } from '@/lib/utils.ts';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { IconFolder } from '@/assets/svg';
import { ArrowUpRightIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

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
    <div className={'flex w-full max-w-[1100px] flex-col gap-2'}>
      <div className={'flex min-w-fit justify-between'}>
        <Label htmlFor="mode" className="min-w-[120px]">
          Saved Result
        </Label>
        <Button size={'sm'} onClick={getFiles}>
          새로고침
        </Button>
      </div>
      <div className={'flex h-80 gap-4'}>
        <ScrollArea className="h-full w-[16rem] rounded-md border">
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
        <DetailOption select={select} cancel={() => setSelect('')} reset={getFiles} />
      </div>
    </div>
  );
}

function DetailOption({
  select,
  cancel,
  reset,
}: {
  select: string;
  cancel: () => void;
  reset: () => Promise<void>;
}) {
  const { data } = useSettingStore();
  if (!select) {
    return <EmptyCard />;
  }

  const { result, date, isPopularOnly, count, dur, lang, keyword, cid } =
    parsedExcelFileName(select);

  const onDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    const result = await window.excelApi.delete(
      `${data.folder.location}/${data.folder.name.result}/${select}`
    );

    if (result) {
      cancel();
      toast.success('삭제되었습니다.');
      await reset();
    } else {
      toast.error('다시 시도해주세요.');
    }
  };
  return (
    <section className="flex h-full flex-1 flex-col gap-3 rounded-md border p-4">
      <header className="flex items-center justify-between">
        <div className={'flex flex-col gap-1'}>
          <h2 className="text-2xl font-bold">{`${date} ${isPopularOnly ? '🔥' : ''}`}</h2>
          <div className={'flex gap-4'}>
            <p className={'text-muted-foreground text-xs'}>{`전체 데이터 수: ${count}`}</p>
            <p className={'text-muted-foreground text-xs'}>{`영상 유형: ${dur}`}</p>
            {!!lang && (
              <p
                className={'text-muted-foreground text-xs'}
              >{`대상 국가/언어: ${lang.toUpperCase()}`}</p>
            )}
          </div>
        </div>
      </header>
      <div className={'flex flex-1 items-center justify-center gap-4'}>
        <Button size={'lg'} className={'w-26'}>
          상세보기
        </Button>
        <Button size="lg" className={'w-26'} variant="destructive" onClick={onDelete}>
          삭제
        </Button>
        <Button size={'lg'} className={'w-26'} variant={'secondary'} onClick={cancel}>
          취소
        </Button>
      </div>
      <dl className="grid grid-cols-2 gap-4 text-sm">
        {Object.keys(result).map((k, i) => {
          return (
            <div key={cid + i}>
              <dt className="text-muted-foreground capitalize">{result[k]?.label}</dt>
              <dd className="ml-1 font-mono">{`${result[k]?.value} ${result[k]?.value === 'keywords' ? ` - ${keyword}` : ''}`}</dd>
            </div>
          );
        })}
      </dl>
    </section>
    // <div className={'h-full flex-1 rounded-md border border-red-500 p-4'}>
    //   <p className={'text-xl'}>{date[0]}</p>
    //   {JSON.stringify(select)}
    // </div>
  );
}

function EmptyCard() {
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
