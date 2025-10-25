import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button.tsx';
import useChannelStore from '@/store/useChannelStore.ts';
import { useMemo } from 'react';
import NotFound from '@/pages/NotFound.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { formatCompactNumber } from '@/lib/utils.ts';
import { Header } from '@/pages/channel-detail/components/Header.tsx';
import ChannelStat from '@/pages/channel-detail/components/ChannelStat.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { format } from 'date-fns';
import { TagChooser } from '@/components/TagChooser.tsx';
import ChartRender from '@/pages/channel-detail/components/ChartRender.tsx';
import { RelatedChannels } from '@/pages/channel-detail/components/RelatedChannels.tsx';

export default function ChannelDetailPage() {
  const params = useParams();
  const { data } = useChannelStore();

  const channel = useMemo(() => {
    return data.find((ch) => ch.channelId === params.channelId);
  }, [params.channelId]);

  if (!channel) {
    return <NotFound />;
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-5 px-4 pb-4">
      <Header channel={channel} />
      <div className={'flex flex-1 gap-5 px-6'}>
        <main className={'scrollNone relative flex w-[75%] overflow-auto'}>
          <section className={'absolute h-full w-full pr-2'}>
            <div className={'flex flex-col gap-4'}>
              <div className={'flex w-full items-end justify-between'}>
                <div className={'flex items-end gap-6'}>
                  <Avatar className={'h-24 w-24'}>
                    <AvatarImage src={channel.icon} alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className={'flex flex-col gap-2'}>
                    <div>
                      <p className={'flex items-center gap-4 text-2xl font-semibold'}>
                        {channel.name}
                        {channel.regionCode !== '' && (
                          <Badge variant={'secondary'} size={'lg'}>
                            {channel.regionCode}
                          </Badge>
                        )}
                        <div className={'flex gap-5'}>
                          <Badge size={'lg'}>가입일: {channel.publishedAt}</Badge>
                          <Badge size={'lg'}>
                            갱신일: {format(channel.fetchedAt, 'yyyy.MM.dd HH:mm')}
                          </Badge>
                        </div>
                      </p>
                      <p className={'text-muted-foreground'}>{channel.handle}</p>
                    </div>
                    <div className={'flex gap-5 text-sm'}>
                      <ChannelStat
                        value={formatCompactNumber(channel.subscriberCount)}
                        label={'구독자'}
                        seq={1}
                      />
                      <ChannelStat
                        value={formatCompactNumber(channel.viewCount)}
                        label={'조회수'}
                        seq={1}
                      />
                      <ChannelStat
                        value={formatCompactNumber(channel.videoCount)}
                        label={'동영상 수'}
                        seq={1}
                      />
                    </div>
                  </div>
                </div>
                <Button size={'lg'} className={'w-fit text-base'}>
                  링크 이동
                </Button>
              </div>
              <TagChooser
                select={channel.tag}
                setSelect={(_) => {}}
                disabled={true}
                variants={'float'}
              />
              <ChartRender channel={channel} />
            </div>
          </section>
        </main>
        <aside className={'flex w-[25%] flex-col gap-2'}>
          <div className={'relative h-full w-full overflow-auto'}>
            <div className={'absolute bottom-0 h-full w-full'}>
              <RelatedChannels channel={channel} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export type cccc = {
  // channelId: string;
  // handle: string;
  // icon: string;
  // name: string;
  // tag: string;
  // publishedAt: string;
  // link: string;
  // regionCode: string;
  // viewCount: number;
  // subscriberCount: number; // ✅ 구독자 수
  memo: string;
  // fetchedAt: string;
  platform: string;
  // videoCount: number;
  // menu: any;
};
