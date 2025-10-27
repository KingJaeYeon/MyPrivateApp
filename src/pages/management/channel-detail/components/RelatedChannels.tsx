import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { formatCompactNumber } from '@/lib/utils.ts';
import { cn } from '@/lib/utils.ts';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import useChannelStore from '@/store/useChannelStore.ts';
import { ChannelColumns } from '@/components/data-table-columns/channel-columns.tsx';
import useTagStore from '@/store/useTagStore.ts';

export function RelatedChannels({ channel }: { channel: ChannelColumns }) {
  const navigate = useNavigate();
  const { data } = useChannelStore();
  const { jsonData } = useTagStore();
  const handleClick = (channelId: string) => {
    navigate(`/manage/channels/${channelId}`);
  };

  const related = useMemo(() => {
    // 현재 채널의 태그 배열
    const curTags = channel.tag
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (curTags.length === 0) return [];

    // 관련 채널 필터링
    return data
      .filter((item) => item.channelId !== channel.channelId) // 자기 자신 제외
      .map((item) => ({
        ...item,
        tags: item.tag
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      }))
      .filter((item) => item.tags.some((tag) => curTags.includes(tag))); // 하나라도 일치하는 태그 존재
  }, [channel, data]);

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="border-b p-4">
        <h3 className="font-semibold">연관 채널</h3>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {related === null ? 0 : related.length}개 채널
        </p>
      </div>

      {/* 채널 리스트 */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-2">
          {related === null
            ? null
            : related.map((channel) => {
                const visibleTags = channel.tag.split(',').slice(0, 5);
                const remainingCount = channel.tag.length - 5;

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
                      <span>조회수 {formatCompactNumber(channel.viewCount)}</span>
                    </div>

                    {/* 3줄: 태그 */}

                    <div className="ml-10 flex flex-wrap gap-1">
                      {visibleTags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="h-5 px-1.5 text-[10px] font-normal"
                        >
                          {jsonData[tag]}
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
                  </button>
                );
              })}
        </div>
      </ScrollArea>
    </div>
  );
}
