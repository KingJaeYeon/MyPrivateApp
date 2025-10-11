import useChannelStore from '@/store/channels.ts';
import { DataTable } from '@/components/data-table.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  ChannelColumns,
  CHANNELS_COLUMNS,
} from '@/components/data-table-columns/channel-columns.tsx';
import useTagStore from '@/store/tag.ts';
import TagSelector from '@/pages/channels/components/TagSelector.tsx';
import { AddChannelModal } from '@/pages/channels/components/AddChannelModal.tsx';

export default function ChannelsPage() {
  const { data, isChanged, saved } = useChannelStore();
  const { data: tags } = useTagStore();

  const onSavedHandler = async () => {
    if (confirm('저장하시겠습니까?')) {
      await saved();
      alert('저장되었습니다.');
    }
  };

  return (
    <div className="flex flex-1 px-4 gap-5 w-full">
      <DataTable<ChannelColumns, unknown>
        columns={CHANNELS_COLUMNS}
        data={data}
        tableControls={(table) => {
          return (
            <div className={'flex justify-between w-full'}>
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
                <AddChannelModal />
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
