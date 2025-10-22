import useChannelStore from '@/store/useChannelStore.ts';
import { DataTable } from '@/components/data-table.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  ChannelColumns,
  CHANNELS_COLUMNS,
} from '@/components/data-table-columns/channel-columns.tsx';
import useTagStore from '@/store/useTagStore.ts';
import { useModalStore } from '@/store/modalStore.ts';
import TagSelector from '@/components/TagSelector.tsx';
import { SchedulerControl } from '@/components/SchedulerControl.tsx';

export default function ChannelsPage() {
  const { data, isChanged, saved } = useChannelStore();
  const { data: tags } = useTagStore();
  const { openModal } = useModalStore();

  const onSavedHandler = async () => {
    if (confirm('저장하시겠습니까?')) {
      await saved();
      alert('저장되었습니다.');
    }
  };

  return (
    <div className="flex w-full flex-1 gap-5 px-4">
      <SchedulerControl />
      <DataTable<ChannelColumns, unknown>
        columns={CHANNELS_COLUMNS}
        data={data}
        isFixHeader={true}
        tableControls={(table) => {
          return (
            <div className={'flex w-full justify-between'}>
              <div className={'flex gap-1'}>
                <TagSelector
                  value={(table.getColumn('tag')?.getFilterValue() as string) ?? ''}
                  setValue={(tagName) => {
                    const matched = tags.find((t) => t.name === tagName);
                    const tagIdx = matched ? matched.idx : ''; // 없으면 필터 해제
                    table.getColumn('tag')?.setFilterValue(tagIdx);
                  }}
                />
                <Button size={'sm'} variant={'outline'} onClick={onSavedHandler}>
                  갱신
                </Button>
              </div>
              <div className={'flex gap-2'}>
                <Button size={'sm'} variant={'secondary'} onClick={() => openModal('channel')}>
                  수정
                </Button>
                <Button
                  size={'sm'}
                  onClick={onSavedHandler}
                  variant={isChanged ? 'destructive' : 'default'}
                >
                  저장
                </Button>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
