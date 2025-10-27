import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog.tsx';
import { DataTable } from '@/components/data-table.tsx';
import { RESULT_COLUMNS, VideoRow } from '@/components/data-table-columns/result-columns.tsx';
import { Button } from '@/components/ui/button.tsx';
import { IconClose } from '@/assets/svg';
import { useState } from 'react';
import useChannelStore from '@/store/useChannelStore.ts';
import { Table } from '@tanstack/react-table';
import { ChannelColumns } from '@/components/data-table-columns/channel-columns.tsx';
import { useNavigate } from 'react-router-dom';

interface ModalProps {
  onClose: () => void;
  data?: VideoRow[];
}

export default function FileResultModal({ onClose, data = [] }: ModalProps) {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const { data: channels } = useChannelStore();
  const navigate = useNavigate();
  const columns = RESULT_COLUMNS(
    isEdit,
    channels.map((r) => r.channelId)
  );

  const handleAddChannels = (_table: Table<VideoRow>) => {
    if (!confirm('정말 추가하시겠습니까?')) {
      return;
    }
    // 선택된 행들 가져오기
    const selectedRows = _table.getSelectedRowModel().rows;
    const selectedChannelIds = Array.from(
      new Set(selectedRows.map((row) => row.original.channelId))
    );

    const filtered = selectedRows.reduce((pre, cur) => {
      const val = cur.original;
      if (selectedChannelIds.includes(val.channelId)) {
        pre.push({
          channelId: val.channelId,
          handle: val.chHandle,
          icon: val.chIcon,
          fetchedAt: val.chFetchAt,
          videoCount: val.chVideoCount,
          name: val.channelTitle,
          viewCount: val.chViewCount,
          regionCode: val.chRegionCode,
          publishedAt: val.chPublishAt,
          link: val.chLink,
          subscriberCount: val.subscriberCount,
          tag: '',
          memo: '',
          platform: 'youtube',
          createdAt: new Date().getTime(),
        });
      }

      return pre;
    }, [] as ChannelColumns[]);

    // API 호출 또는 데이터 저장
    navigate('/manage/channels/edit', { state: filtered });
    onClose();
  };

  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent className={'h-full min-w-full'}>
        <AlertDialogHeader>
          <div className="flex w-full flex-1 px-4">
            <DataTable<VideoRow, unknown>
              columns={columns}
              hasNo={true}
              isEdit={isEdit}
              data={data}
              fontSize={{ head: 'text-0.5xs', cell: 'text-1.5xs' }}
              tableControls={(_table) => {
                return (
                  <div className={'flex w-full items-center justify-between gap-2 pt-4'}>
                    <div className={'flex items-center gap-2'}>
                      <div className={'text-muted-foreground text-sm'}>엑셀파일</div>
                      <div className={'flex gap-2'}>
                        {isEdit && (
                          <Button
                            className={'text-sm'}
                            variant={'default'}
                            size={'sm'}
                            onClick={() => handleAddChannels(_table)}
                            disabled={_table.getSelectedRowModel().rows.length === 0}
                          >
                            Add Channels
                          </Button>
                        )}
                        <Button
                          className={'text-sm'}
                          variant={'secondary'}
                          size={'sm'}
                          onClick={() => setIsEdit((prev) => !prev)}
                        >
                          {isEdit ? 'Cancel' : 'Edit'}
                        </Button>
                      </div>
                    </div>
                    <Button
                      size={'icon-sm'}
                      variant={'outline'}
                      className={'text-sm'}
                      onClick={onClose}
                    >
                      <IconClose />
                    </Button>
                  </div>
                );
              }}
            />
          </div>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}
