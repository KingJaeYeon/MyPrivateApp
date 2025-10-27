import useChannelStore from '@/store/useChannelStore.ts';
import { DataTable } from '@/components/data-table.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  ChannelColumns,
  CHANNELS_MODAL_COLUMNS,
} from '@/components/data-table-columns/channel-columns.tsx';
import useChannelHistoryStore, { ChannelHistory } from '@/store/useChannelHistoryStore.ts';
import useSettingStore from '@/store/useSettingStore.ts';
import { HandleSearchForm } from '@/pages/management/channel-edit/components/HandleSearchForm.tsx';
import { useMutation } from '@tanstack/react-query';
import { fetchChannelsByHandle } from '@/service/youtube.channels.ts';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { ChannelEditPanel } from '@/pages/management/channel-edit/components/ChannelEditPanel.tsx';
import { SaveAllIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function ChannelsEditPage() {
  const usedQuota = useSettingStore((r) => r.data.youtube.usedQuota);
  const {
    data: curChannels,
    update: channelUpdate,
    saved: savedC,
    isChanged: isChangedC,
  } = useChannelStore();
  const { data: curHistory, update: historyUpdate } = useChannelHistoryStore();
  const [select, setSelect] = useState<ChannelColumns | null>(null);
  const location = useLocation();
  const { saved: savedH } = useChannelHistoryStore();
  const youtubeApiKey = useSettingStore((r) => r.data.youtube.apiKey);

  const onSavedHandler = async () => {
    if (confirm('저장하시겠습니까?')) {
      await savedH();
      await savedC();
      toast.success('저장되었습니다.');
    }
  };
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
      const history: ChannelHistory[] = addArr.map((ch) => ({
        channelId: ch.channelId,
        fetchedAt: ch.fetchedAt,
        subscriberCount: ch.subscriberCount,
        videoCount: ch.videoCount,
        viewCount: ch.viewCount,
      }));
      historyUpdate([...curHistory, ...history]);
      channelUpdate([...curChannels, ...addArr]);
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
    const data = location.state;
    if (data && data.length >= 1) {
      const curIds = curChannels.map((r) => r.channelId);

      const filtered: ChannelColumns[] = data.filter((v: any) => !curIds.includes(v.channelId));
      const history: ChannelHistory[] = filtered.map((ch) => ({
        channelId: ch.channelId,
        fetchedAt: ch.fetchedAt,
        subscriberCount: ch.subscriberCount,
        videoCount: ch.videoCount,
        viewCount: ch.viewCount,
      }));
      channelUpdate([...curChannels, ...filtered]);
      historyUpdate([...curHistory, ...history]);
      toast.success('변경되었습니다.');
    }
  }, [location.state]);

  return (
    <div className="flex h-full w-full flex-1 flex-col gap-5 px-4 pb-4">
      <div>
        <div className={'mb-2 flex w-full items-center justify-between gap-2'}>
          <div className={'flex items-center gap-2'}>
            <div>채널추가</div>
            <div className={'text-sm'}>
              (사용한 쿼터:{' '}
              <span className={'font-mono'}>{usedQuota.toLocaleString()} / 10000)</span>
            </div>
          </div>
          <div className={'flex justify-between'}>
            <div className={'fixed top-15 right-8 gap-2'}>
              <Button
                size={'sm'}
                onClick={onSavedHandler}
                variant={isChangedC ? 'destructive' : 'secondary'}
              >
                <SaveAllIcon />
                엑셀파일 갱신
              </Button>
            </div>
          </div>
        </div>
        <HandleSearchForm onSearch={(handles) => mutate({ handles })} isPending={isPending} />
      </div>
      <div className={'mt-2 flex flex-1 gap-2'}>
        <DataTable<ChannelColumns, unknown>
          columns={CHANNELS_MODAL_COLUMNS}
          data={curChannels}
          isFixHeader={true}
          onSelectedRow={setSelect}
          name={'addChannelModal'}
          enableMultiRowSelection={false}
          enableRowClickSelection={true}
          initialSorting={[{ id: 'createdAt', desc: true }]}
        />
        <ChannelEditPanel select={select} setSelect={setSelect} />
      </div>
    </div>
  );
}
