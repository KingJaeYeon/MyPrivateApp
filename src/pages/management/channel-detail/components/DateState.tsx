import { Badge } from '@/components/ui/badge.tsx';
import { format } from 'date-fns';
import Tip from '@/components/Tip.tsx';
import { useSidebar } from '@/components/ui/sidebar.tsx';
import { ChannelColumns } from '@/components/data-table-columns/channel-columns.tsx';

export default function DateState({ channel }: { channel: ChannelColumns }) {
  const { state } = useSidebar();

  if (state === 'collapsed') {
    return (
      <div className={'flex gap-5'}>
        <Badge size={'lg'}>가입일: {channel.publishedAt}</Badge>
        <Badge size={'lg'}>갱신일: {format(channel.fetchedAt, 'yyyy.MM.dd HH:mm')}</Badge>
      </div>
    );
  }

  return (
    <Tip
      txt={`가입일: ${channel.publishedAt}\n갱신일: ${format(channel.fetchedAt, 'yyyy.MM.dd HH:mm')}`}
      triggerClssName={'flex'}
    >
      <Badge size={'lg'}>Date</Badge>
    </Tip>
  );
}
