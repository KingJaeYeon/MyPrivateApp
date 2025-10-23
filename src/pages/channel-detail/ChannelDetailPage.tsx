import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button.tsx';
import { IconPrev } from '@/assets/svg';
import useChannelStore from '@/store/useChannelStore.ts';
import { useMemo } from 'react';
import NotFound from '@/pages/NotFound.tsx';

export default function ChannelDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { data } = useChannelStore();

  const channel = useMemo(() => {
    return data.find((ch) => ch.channelId === params.channelId);
  }, [params.channelId]);

  return (
    <div className="flex w-full flex-1 flex-col gap-5 px-4">
      <Button size={'icon'} variant={'secondary'} onClick={() => navigate(-1)}>
        <IconPrev />
      </Button>
      {!channel ? <div>channels/Id {params.channelId}</div> : <NotFound />}
    </div>
  );
}
