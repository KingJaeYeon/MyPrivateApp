import useSettingStore from '@/store/useSettingStore.ts';
import { useModalStore } from '@/store/modalStore.ts';
import { EmptyCard } from '@/pages/youtube/saved-list/components/EmptyCard.tsx';
import { parsedExcelFileName } from '@/lib/utils.ts';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button.tsx';
import { ExternalLink, Trash2 } from 'lucide-react';

export default function DetailOption({
  select,
  cancel,
  reset,
}: {
  select: { fileName: string; label: string };
  cancel: () => void;
  reset: () => Promise<void>;
}) {
  const { data } = useSettingStore();
  const { openModal } = useModalStore();

  if (!select.fileName) {
    return (
      <div className={'flex flex-1 flex-col gap-2'}>
        <div className={'flex h-14 w-full items-end justify-end gap-2 py-2'}></div>
        <EmptyCard />
      </div>
    );
  }

  const { result, date, isPopularOnly, count, dur, lang, keyword, cid } = parsedExcelFileName(
    select.fileName
  );

  const onDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    const result = await window.excelApi.delete(
      `${data.folder.location}/${data.folder.name.result}/${select.fileName}`
    );

    if (result) {
      cancel();
      toast.success('삭제되었습니다.');
      await reset();
    } else {
      toast.error('다시 시도해주세요.');
    }
  };

  const onDetail = async () => {
    const rows = await window.excelApi.read(
      `${data.folder.location}/${data.folder.name.result}/${select.fileName}`
    );
    const result = rows.map((r, i) => {
      const tags = !!r.tags ? r.tags.split('_') : [];
      return { ...r, no: i + 1, tags };
    });
    openModal('result', result);
  };

  return (
    <div className={'flex flex-1 flex-col gap-2 p-3'}>
      <div className={'flex w-full items-end justify-between border-b py-5'}>
        <div className={'flex flex-col gap-0.5 text-xl font-semibold'}>
          <div className={'flex gap-4'}>
            <p>{date}</p>
            <p>
              {select.label} {isPopularOnly ? '🔥' : ''}
            </p>
          </div>
          <p className={'text-muted-foreground text-xs'}>전체 데이터 수: {count}</p>
        </div>
        <div className={'flex gap-2'}>
          <Button size={'sm'} onClick={onDetail}>
            <ExternalLink className="mr-1 h-4 w-4" /> 상세
          </Button>
          <Button size="sm" variant="destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <section className="flex flex-1 flex-col gap-14 rounded-md pt-10">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          {Object.keys(result).map((k, i) => {
            return (
              <div key={cid + i}>
                <dt className="text-muted-foreground capitalize">{result[k]?.label}</dt>
                <dd className="ml-1 font-mono">{`${result[k]?.value} ${result[k]?.value === 'keywords' ? ` - ${keyword}` : ''}`}</dd>
              </div>
            );
          })}
          <div>
            <dt className="text-muted-foreground capitalize">영상 유형</dt>
            <dd className="ml-1 font-mono">{dur}</dd>
          </div>
          {!!lang && (
            <div>
              <dt className="text-muted-foreground capitalize">대상 국가/언어</dt>
              <dd className="ml-1 font-mono">{lang.toUpperCase()}</dd>
            </div>
          )}
        </dl>
      </section>
    </div>
  );
}
