import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, ListChecks, RefreshCcw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Youtube } from '@/assets/svg';
import useTagStore from '@/store/useTagStore.ts';
import useChannelStore from '@/store/useChannelStore.ts';
import useReferenceStore from '@/store/useReferenceStore.ts';
import { Button } from '@/components/ui/button.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';

export default function DashboardPage() {
  const { data: tagData } = useTagStore();
  const { data: channelData } = useChannelStore();
  const { data: referenceData } = useReferenceStore();

  const { data, refetch, isPending } = useQuery({
    queryFn: async () => {
      const tagNames = ['영어', 'english'];
      const findTags = tagData?.filter(
        (tag) => tag?.name?.includes(tagNames[0]) || tag?.name?.includes(tagNames[1])
      );

      if (!findTags || findTags.length === 0) return { channels: [], references: [] };

      // 3️⃣ 태그 idx 목록
      const tagIds = findTags.map((tag) => tag.idx);

      const findChannels = channelData.filter((ch) => {
        if (!ch.tag) return false;
        const channelTags = ch.tag
          .toString()
          .split(',')
          ?.map((id) => parseInt(id.trim()));
        return channelTags.some((id) => tagIds.includes(id.toString()));
      });

      const findReference = referenceData.filter((r) => {
        if (!r.tag) return false;
        const referenceTags = r.tag
          .toString()
          .split(',')
          .map((id) => parseInt(id.trim()));
        return referenceTags.some((id) => tagIds.includes(id.toString()));
      });
      return { findChannels, findReference, findTags };
    },
    queryKey: ['dashboard'],
  });

  return (
    <div className="flex h-full w-full flex-col gap-6 px-6 pb-6">
      {/* 제목 영역 */}
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h2 className="text-foreground text-2xl font-bold tracking-tight">
            🎯 English Content Overview
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            YouTube 채널과 Reference 데이터에서{' '}
            <span className="text-primary font-semibold">English</span> 또는{' '}
            <span className="text-primary font-semibold">영어</span> 관련 태그가 포함된 모든 항목을
            자동으로 탐색합니다.
          </p>
        </div>
        <button onClick={() => refetch()}>
          <RefreshCcw />
        </button>
      </div>
      <MainContent data={data} isPending={isPending} />
      {/* 하단 섹션 */}
      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <p className="text-muted-foreground flex items-center gap-1 text-sm">
          <ListChecks className="text-primary h-4 w-4" />
          모든 데이터는 최신 엑셀 파일 기준으로 동기화됩니다.
        </p>
      </div>
    </div>
  );
}

function MainContent({ isPending, data }: { isPending: boolean; data: any }) {
  if (isPending || data === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* 채널 섹션 */}
      <Card className="transition hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Youtube className="text-primary h-5 w-5" />
            <CardTitle className="text-lg font-semibold">Channels</CardTitle>
          </div>
          <span className="text-muted-foreground text-xs">from channel.xlsx</span>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[280px] pr-2">
            <ul className="space-y-2 text-sm">
              {data?.findChannels?.length === 0 ? (
                <div>관련된 Reference가 없습니다. 추가해주세요.</div>
              ) : (
                data?.findChannels?.map((r: any) => (
                  <li className="flex items-center justify-between border-b pb-2">
                    <div className={'flex items-center justify-between gap-2'}>
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={r.icon} />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <Button
                        size={'sm'}
                        variant={'link'}
                        className={'shrink px-0 text-start text-xs font-semibold whitespace-normal'}
                        onClick={() => window.electronAPI.openExternal(r.link)}
                      >
                        {r.name}
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-xs">{r.memo}</p>
                  </li>
                ))
              )}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Reference 섹션 */}
      <Card className="transition hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="text-primary h-5 w-5" />
            <CardTitle className="text-lg font-semibold">Reference</CardTitle>
          </div>
          <span className="text-muted-foreground text-xs">from reference.xlsx</span>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[280px] pr-2">
            <ul className="space-y-2 text-sm">
              {data?.findReference?.length === 0 ? (
                <div>관련된 Reference가 없습니다. 추가해주세요.</div>
              ) : (
                data?.findReference?.map((r: any) => (
                  <li className="border-b pb-2">
                    <Button
                      size={'sm'}
                      variant={'link'}
                      className={'shrink px-0 text-start text-xs font-semibold whitespace-normal'}
                      onClick={() => window.electronAPI.openExternal(r.link)}
                    >
                      {r.name}
                    </Button>
                    <p className="text-muted-foreground text-xs">{r.memo}</p>
                  </li>
                ))
              )}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
