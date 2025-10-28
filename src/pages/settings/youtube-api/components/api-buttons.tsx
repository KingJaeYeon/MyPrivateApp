import { Button } from '@/components/ui/button.tsx';
import { BanIcon, Trash2 } from 'lucide-react';
import useSettingStore from '@/store/useSettingStore.ts';
import { useMutation } from '@tanstack/react-query';
import { pingTest } from '@/service/pingtest.ts';
import React from 'react';
import useChannelsSchedule from '@/hooks/use-channels-schedule.ts';
import { toast } from 'sonner';
import { useModalStore } from '@/store/modalStore.ts';

export function DeleteButton() {
  const { updateIn } = useSettingStore();
  const { handleStop } = useChannelsSchedule();
  const { openModal } = useModalStore();

  const deleteKey = async () => {
    const isDelete = confirm('정말 삭제하시겠습니까?');
    if (isDelete) {
      await updateIn('youtube', { usedQuota: 0, apiKey: '', quotaUpdatedAt: '' });
      await handleStop();
      openModal('alert', '삭제되었습니다. 다시 입력해주세요.');
    }
  };

  return (
    <Button variant="destructive" onClick={deleteKey}>
      <Trash2 />
    </Button>
  );
}

export function ConnectButton({
  editValue,
  setIsEditing,
}: {
  editValue: string;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { updateIn } = useSettingStore();
  const { openModal } = useModalStore();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ apiKey }: { apiKey: string }) => pingTest({ apiKey, type: 'youtubeApiKey' }),
    onSuccess: async () => {
      await updateIn('youtube', {
        apiKey: editValue,
        usedQuota: 0,
        quotaUpdatedAt: new Date().toLocaleString(),
      });
      setIsEditing(false);
      toast.success('API 키 저장 완료');
    },
    onError: async (error: any) => {
      if (error.message.includes('quota')) {
        await updateIn('youtube', {
          apiKey: editValue,
          usedQuota: 10000,
          quotaUpdatedAt: new Date().toLocaleString(),
        });
        toast.warning('API 키가 저장되었습니다. 다만 할당량이 초과되었습니다.');
        return;
      }
      openModal('alert', 'API 키가 유효하지 않거나 연결에 실패했습니다: ' + error.message);
    },
  });
  return (
    <Button
      disabled={isPending}
      onClick={() => {
        if (!editValue || editValue.trim() === '') {
          openModal('alert', 'API 키를 입력해주세요.');
          return;
        }
        mutate({ apiKey: editValue.trim() });
      }}
    >
      연결
    </Button>
  );
}

export function CancelButton({
  setIsEditing,
  setEditValue,
}: {
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setEditValue: React.Dispatch<React.SetStateAction<string>>;
}) {
  const handleCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };
  return (
    <Button variant="secondary" onClick={handleCancel}>
      <BanIcon />
    </Button>
  );
}

export function EditButton({
  setIsEditing,
  setEditValue,
}: {
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setEditValue: React.Dispatch<React.SetStateAction<string>>;
}) {
  const youtubeApiKey = useSettingStore((r) => r.data.youtube.apiKey);

  const handleEdit = () => {
    setIsEditing((prev) => !prev);
    // 현재 저장된 값으로 초기화
    setEditValue(youtubeApiKey);
  };

  return (
    <Button variant="secondary" onClick={() => handleEdit()}>
      수정
    </Button>
  );
}
