import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCompactNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';

type RelatedChannel = {
  channelId: string;
  name: string;
  icon: string;
  subscriberCount: number;
  videoCount: number;
  tags: string[];
};

// 임시 데이터
const mockChannels: RelatedChannel[] = [
  {
    channelId: '1',
    name: 'Veritasium',
    icon: 'https://yt3.googleusercontent.com/ytc/AIdro_kGrHhRWttF8xWLlL4JT76CY7Rcy8r1VMqrPiPzpA=s176-c-k-c0x00ffffff-no-rj',
    subscriberCount: 14500000,
    videoCount: 456,
    tags: ['과학', '교육', '실험', '물리', '화학'],
  },
  {
    channelId: '2',
    name: 'Kurzgesagt',
    icon: 'https://yt3.googleusercontent.com/ytc/AIdro_mXmqQOq6ISKjIwzH3H9cj0CzHqh5H76V_2RJXR=s176-c-k-c0x00ffffff-no-rj',
    subscriberCount: 21000000,
    videoCount: 189,
    tags: ['과학', '애니메이션', '교육'],
  },
  {
    channelId: '3',
    name: 'Mark Rober',
    icon: 'https://yt3.googleusercontent.com/ytc/AIdro_k-p-_wJKGJzusxC9p0c-vGFuXPSZGuf6-hD-FE=s176-c-k-c0x00ffffff-no-rj',
    subscriberCount: 25000000,
    videoCount: 124,
    tags: ['과학', '공학', '실험', '발명', 'DIY', 'NASA', '로봇'],
  },
  {
    channelId: '4',
    name: 'Vsauce',
    icon: 'https://yt3.googleusercontent.com/ytc/AIdro_nUBLjL0YBXLiXc4V9qsYON3FQmM8CqzVq0SHmYpQ=s176-c-k-c0x00ffffff-no-rj',
    subscriberCount: 18500000,
    videoCount: 523,
    tags: ['과학', '철학', '수학'],
  },
  {
    channelId: '5',
    name: '3Blue1Brown',
    icon: 'https://yt3.googleusercontent.com/ytc/AIdro_lPQu-Lev1F8kVhkPL3XoH5RIFHq3LYWA-CjcQw=s176-c-k-c0x00ffffff-no-rj',
    subscriberCount: 5400000,
    videoCount: 145,
    tags: ['수학', '애니메이션', '교육', '선형대수'],
  },
  {
    channelId: '6',
    name: 'Physics Girl',
    icon: 'https://yt3.googleusercontent.com/ytc/AIdro_kfRJBrz1z_lNKgKcr5OP3HJPFQPm5h6DhJnJrP=s176-c-k-c0x00ffffff-no-rj',
    subscriberCount: 2100000,
    videoCount: 287,
    tags: ['물리', '과학', '실험', '교육'],
  },
];

type Props = {
  channels?: RelatedChannel[];
  onChannelClick?: (channelId: string) => void;
};

export function RelatedChannels({ channels = mockChannels, onChannelClick }: Props) {
  const handleClick = (channelId: string) => {
    if (onChannelClick) {
      onChannelClick(channelId);
    } else {
      // 기본 동작: 페이지 이동
      window.location.href = `/channel/${channelId}`;
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="border-b p-4">
        <h3 className="font-semibold">연관 채널</h3>
        <p className="text-muted-foreground mt-0.5 text-xs">{channels.length}개 채널</p>
      </div>

      {/* 채널 리스트 */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-2">
          {channels.map((channel) => {
            const visibleTags = channel.tags.slice(0, 5);
            const remainingCount = channel.tags.length - 5;

            return (
              <button
                key={channel.channelId}
                onClick={() => handleClick(channel.channelId)}
                className={cn(
                  'flex flex-col gap-2 rounded-lg p-3 text-left transition-colors',
                  'hover:bg-accent/50 active:bg-accent'
                )}
              >
                {/* 1줄: 아이콘 + 채널명 */}
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={channel.icon} />
                    <AvatarFallback>{channel.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 truncate text-sm font-medium">{channel.name}</span>
                </div>

                {/* 2줄: 구독자 & 영상수 */}
                <div className="text-muted-foreground ml-10 flex items-center gap-2 text-xs">
                  <span>구독 {formatCompactNumber(channel.subscriberCount)}</span>
                  <span>·</span>
                  <span>영상 {formatCompactNumber(channel.videoCount)}</span>
                  <span>·</span>
                  <span>조회수 {formatCompactNumber(channel.videoCount)}</span>
                </div>

                {/* 3줄: 태그 */}
                {channel.tags.length > 0 && (
                  <div className="ml-10 flex flex-wrap gap-1">
                    {visibleTags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="h-5 px-1.5 text-[10px] font-normal"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {remainingCount > 0 && (
                      <Badge
                        variant="outline"
                        className="h-5 px-1.5 text-[10px] font-normal"
                        title={channel.tags.slice(5).join(', ')}
                      >
                        +{remainingCount}
                      </Badge>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
