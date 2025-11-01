import useChannelStore from '@/store/useChannelStore.ts';
import { DataTable } from '@/components/data-table.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  ChannelColumns,
  CHANNELS_COLUMNS,
} from '@/components/data-table-columns/channel-columns.tsx';
import useTagStore from '@/store/useTagStore.ts';
import TagSelector from '@/components/TagSelector.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';

export default function ChannelsPage() {
  const { data } = useChannelStore();
  const { data: tags } = useTagStore();
  const navigate = useNavigate();
  const [selectTag, setSelectTag] = useState('');

  const channels = useMemo(() => {
    if (selectTag === '') {
      return data;
    }

    return data.filter((item) => {
      return item.tag.split(',').includes(selectTag);
    });
  }, [data, selectTag]);
  return (
    <div className="flex h-full w-full flex-1 gap-5 px-4 pb-4">
      <DataTable<ChannelColumns, unknown>
        columns={CHANNELS_COLUMNS}
        data={channels}
        isFixHeader={true}
        initialSorting={[{ id: 'createdAt', desc: true }]}
        tableControls={(table) => {
          return (
            <div className={'flex w-full justify-between'}>
              <div className={'flex items-center gap-4'}>
                <TagSelector
                  value={selectTag}
                  setValue={(tagName) => {
                    const matched = tags.find((t) => t.name === tagName);
                    const tagIdx = matched ? matched.idx : ''; // 없으면 필터 해제
                    setSelectTag(tagIdx);
                  }}
                />
                <Badge>{`채널: ${table.getFilteredRowModel().rows.length}/${data.length}`}</Badge>
              </div>
              <div className={'flex gap-2'}>
                <Button
                  size={'sm'}
                  variant={'secondary'}
                  onClick={() => navigate('/manage/channels/edit')}
                >
                  수정
                </Button>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
