import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import Tip from '@/components/Tip.tsx';
import useTagStore from '@/store/useTagStore.ts';
import { Youtube } from '@/assets/svg';

const nf = new Intl.NumberFormat();

export type ChannelColumns = {
  channelId: string;
  handle: string;
  icon: string;
  name: string;
  tag: string;
  publishedAt: string;
  link: string;
  regionCode: string;
  viewCount: number;
  subscriberCount: number; // ✅ 구독자 수
  memo: string;
  fetchedAt: string;
  platform: string;
  videoCount: number;
};

const formatNumber = (num: number) => (
  <span className="text-xs tabular-nums">{nf.format(num)}</span>
);

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success(`${text} 복사완료`);
};

export const CHANNELS_COLUMNS: ColumnDef<ChannelColumns>[] = [
  {
    accessorKey: 'name',
    header: '채널명',
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-xs">
        <Avatar className="h-6 w-6">
          <AvatarImage src={row.original.icon} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <p className="font-bold">{row.original.name}</p>
      </div>
    ),
  },
  {
    accessorKey: 'handle',
    header: '핸들',
    cell: ({ row }) => (
      <p
        className="cursor-pointer text-xs font-bold break-words"
        onClick={() => copyToClipboard(row.original.handle)}
      >
        {row.original.handle}
      </p>
    ),
  },
  {
    accessorKey: 'tag',
    header: '태그',
    maxSize: 1000,
    minSize: 200,
    cell: ({ row }) => {
      const tags = useTagStore.getState().jsonData;
      return (
        <div className="flex flex-wrap gap-1">
          {row.original.tag.split(',').map((tag) => (
            <Badge variant="secondary" key={tag} size="sm">
              {tags[tag]}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'regionCode',
    header: '국가',
    size: 50,
    cell: ({ row }) => <p className="text-xs">{row.original.regionCode}</p>,
  },
  {
    accessorKey: 'subscriberCount',
    header: '구독자 수',
    size: 50,
    cell: ({ row }) => formatNumber(row.original.subscriberCount),
  },
  {
    accessorKey: 'viewCount',
    header: '총 조회수',
    size: 120,
    cell: ({ row }) => formatNumber(row.original.viewCount),
  },
  {
    accessorKey: 'videoCount',
    header: '동영상 수',
    cell: ({ row }) => formatNumber(row.original.videoCount),
  },
  {
    accessorKey: 'memo',
    header: '메모',
    maxSize: 400,
    minSize: 200,
    cell: ({ row }) => (
      <Tip txt={row.original.memo} className="max-w-[400px]">
        <span className="ellipsisLine2 max-w-[300px] min-w-[100px] cursor-pointer text-xs break-words whitespace-normal">
          {row.original.memo}
        </span>
      </Tip>
    ),
  },
  {
    accessorKey: 'publishedAt',
    header: '생성일',
    size: 120,
    cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.publishedAt}</span>,
  },
  {
    accessorKey: 'platform',
    header: '플랫폼',
    cell: ({ row }) =>
      row.original.platform === 'youtube' ? (
        <div className="flex items-center justify-center">
          <Youtube className="text-red-600" />
        </div>
      ) : (
        <Badge variant="destructive">{row.original.platform}</Badge>
      ),
  },
  {
    accessorKey: 'fetchedAt',
    header: '갱신날짜',
    size: 120,
    cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.fetchedAt}</span>,
  },
  {
    accessorKey: 'link',
    header: '링크',
    size: 120,
    enableSorting: false,
    cell: ({ row }) => (
      <Button
        size="sm"
        variant="secondary"
        onClick={() => window.electronAPI.openExternal(row.original.link)}
      >
        열기
      </Button>
    ),
  },
];
