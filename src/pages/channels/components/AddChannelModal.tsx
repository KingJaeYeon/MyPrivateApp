import useSettingStore from '@/store/setting.ts';
import useChannelStore from '@/store/channels.ts';
import { useState } from 'react';
import {
  ChannelColumns,
  CHANNELS_COLUMNS,
} from '@/components/data-table-columns/channel-columns.tsx';
import { useMutation } from '@tanstack/react-query';
import { fetchChannelsByHandle } from '@/service/youtube.channels.ts';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { DataTable } from '@/components/data-table.tsx';
import { HandleSearchForm } from '@/pages/channels/components/HandleSearchForm.tsx';
import { ChannelEditPanel } from '@/pages/channels/components/ChannelEditPanel.tsx';

export function AddChannelModal() {
  const usedQuota = useSettingStore((r) => r.data.youtube.usedQuota);
  const { data, update } = useChannelStore();
  const [select, setSelect] = useState<ChannelColumns | null>(null);
  const youtubeApiKey = useSettingStore((r) => r.data.youtube.apiKey);

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ handles }: { handles: string }) => {
      if (handles.trim() === '') {
        throw new Error('Handle을 입력하세요.');
      }
      //duplicate check
      const handleArr = handles
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c !== '');
      const existingHandles = data.map((d) => d.handle);
      const newHandles = handleArr.filter((id) => !existingHandles.includes(id));
      if (newHandles.length === 0) {
        throw new Error('이미 추가된 채널입니다.');
      }

      return fetchChannelsByHandle({ apiKey: youtubeApiKey, handles: newHandles });
    },
    onSuccess: (result) => {
      const existingIds = data.map((d) => d.channelId);
      const addArr = result.filter((channel) => !existingIds.includes(channel.channelId));
      const duplicates = result.filter((channel) => existingIds.includes(channel.channelId));
      update([...data, ...addArr]);

      if (duplicates.length > 0) {
        const txt = `중복된 채널은 추가되지 않았습니다.\n채널정보를 갱신해주세요: ${duplicates.map((d) => d.handle).join(', ')}`;
        toast.error(txt);
      }
      toast.success(`${addArr.length}개의 채널이 추가되었습니다.`);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button size={'sm'} variant={'secondary'}>
          수정
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className={'max-w-[calc(100%-100px)] h-[calc(100%-100px)] flex flex-col'}>
        <AlertDialogHeader className={'flex flex-1'}>
          <AlertDialogTitle className={'flex gap-2 items-center mb-4'}>
            <div className={'text-xl'}>채널추가</div>
            <div className={'text-sm'}>
              (사용한 쿼터:{' '}
              <span className={'font-mono'}>{usedQuota.toLocaleString()} / 10000)</span>
            </div>
          </AlertDialogTitle>
          <div className={'flex-1 flex flex-col'}>
            <HandleSearchForm onSearch={(handles) => mutate({ handles })} isPending={isPending} />
            <div className={'flex flex-1 gap-2 mt-2'}>
              <DataTable<ChannelColumns, unknown>
                columns={CHANNELS_COLUMNS}
                onClickRow={setSelect}
                data={data}
              />
              <ChannelEditPanel select={select} setSelect={setSelect} />
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className={'h-fit'}>
          <AlertDialogCancel>닫기</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
