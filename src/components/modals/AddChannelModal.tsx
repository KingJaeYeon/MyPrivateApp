import useSettingStore from '@/store/useSettingStore.ts';
import useChannelStore from '@/store/useChannelStore.ts';
import { useEffect, useState } from 'react';
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
} from '@/components/ui/alert-dialog.tsx';
import { DataTable } from '@/components/data-table.tsx';
import { HandleSearchForm } from '@/pages/channels/components/HandleSearchForm.tsx';
import { ChannelEditPanel } from '@/pages/channels/components/ChannelEditPanel.tsx';
import { useModalStore } from '@/store/modalStore.ts';
import { Button } from '@/components/ui/button.tsx';

interface ModalProps {
  onClose: () => void;
  data?: { data: any[]; isChanged: boolean };
}

export function AddChannelModal({ onClose, data }: ModalProps) {
  const usedQuota = useSettingStore((r) => r.data.youtube.usedQuota);
  const { data: curChannels, update } = useChannelStore();
  const [select, setSelect] = useState<ChannelColumns | null>(null);
  const youtubeApiKey = useSettingStore((r) => r.data.youtube.apiKey);
  const { reOpenModal } = useModalStore();

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
      const existingHandles = curChannels.map((d) => d.handle);
      const newHandles = handleArr.filter((id) => !existingHandles.includes(id));
      if (newHandles.length === 0) {
        throw new Error('이미 추가된 채널입니다.');
      }

      return fetchChannelsByHandle({ apiKey: youtubeApiKey, handles: newHandles });
    },
    onSuccess: (result) => {
      const existingIds = curChannels.map((d) => d.channelId);
      const addArr = result.filter((channel) => !existingIds.includes(channel.channelId));
      const duplicates = result.filter((channel) => existingIds.includes(channel.channelId));
      update([...curChannels, ...addArr]);

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

  useEffect(() => {
    if (data?.data && data.data.length >= 1) {
      const curIds = curChannels.map((r) => r.channelId);

      const filtered = data.data.filter((v) => !curIds.includes(v.channelId));
      update([...curChannels, ...filtered]);
    }
  }, [data]);

  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent className={'flex h-[calc(100%-100px)] max-w-[calc(100%-100px)] flex-col'}>
        <AlertDialogHeader className={'flex flex-1'}>
          <AlertDialogTitle className={'mb-4 flex items-center gap-2'}>
            <div>채널추가</div>
            <div className={'text-sm'}>
              (사용한 쿼터:{' '}
              <span className={'font-mono'}>{usedQuota.toLocaleString()} / 10000)</span>
            </div>
          </AlertDialogTitle>
          <div className={'flex flex-1 flex-col'}>
            <HandleSearchForm onSearch={(handles) => mutate({ handles })} isPending={isPending} />
            <div className={'mt-2 flex flex-1 gap-2'}>
              <DataTable<ChannelColumns, unknown>
                columns={CHANNELS_COLUMNS}
                onClickRow={setSelect}
                data={curChannels}
              />
              <ChannelEditPanel select={select} setSelect={setSelect} />
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className={'h-fit'}>
          {data?.isChanged && <Button onClick={() => reOpenModal('result')}>뒤로가기</Button>}
          <AlertDialogCancel>닫기</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
