import { ChannelColumns } from '@/components/data-table-columns/channel-columns.tsx';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.tsx';
import { IconPrev } from '@/assets/svg';

export function Header({ channel }: { channel: ChannelColumns }) {
  const navigate = useNavigate();
  return (
    <div className={'flex items-center gap-4'}>
      <Button size={'icon'} variant={'secondary'} onClick={() => navigate(-1)}>
        <IconPrev />
      </Button>
      <p className={'text-muted-foreground'}>{channel.channelId}</p>
    </div>
  );
}
