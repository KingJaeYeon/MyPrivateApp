import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import Tip from '@/components/Tip.tsx';
import useTagStore from '@/store/useTagStore.ts';
import { Youtube } from '@/assets/svg';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import ColumnMenu from '@/components/data-table-columns/ColumnMenu.tsx';
import { formatNumber } from '@/lib/utils';

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
  menu: any;
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success(`${text} 복사완료`);
};

export const CHANNELS_COLUMNS: ColumnDef<ChannelColumns>[] = [
  {
    accessorKey: 'name',
    header: '채널명',
    cell: ({ row }) => (
      <div className="flex items-center gap-2 py-2 text-xs">
        <Avatar className="h-6 w-6">
          <AvatarImage src={row.original.icon} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <p className="font-bold whitespace-break-spaces">{row.original.name}</p>
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
      const cur = row.original.tag.split(',');
      return (
        <div className="flex flex-wrap gap-1">
          {cur[0] === '' ? (
            <Badge variant="destructive" key={'none'} size="sm">
              N/A
            </Badge>
          ) : (
            cur.map((tag) => (
              <Badge variant="green" key={tag} size="sm">
                {tags[tag]}
              </Badge>
            ))
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'regionCode',
    header: '국가',
    size: 50,
    cell: ({ row }) => (
      <p className="text-xs">{row.original.regionCode === '' ? '-' : row.original.regionCode}</p>
    ),
  },
  {
    accessorKey: 'subscriberCount',
    header: '구독자 수',
    size: 50,
    cell: ({ row }) => (
      <span className="text-xs tabular-nums">{formatNumber(row.original.subscriberCount)}</span>
    ),
  },
  {
    accessorKey: 'viewCount',
    header: '총 조회수',
    size: 120,
    cell: ({ row }) => (
      <span className="text-xs tabular-nums">{formatNumber(row.original.viewCount)}</span>
    ),
  },
  {
    accessorKey: 'videoCount',
    header: '동영상 수',
    cell: ({ row }) => (
      <span className="text-xs tabular-nums">{formatNumber(row.original.videoCount)}</span>
    ),
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

    cell: ({ row }) => (
      <span className="text-xs tabular-nums">
        {format(row.original.fetchedAt, 'yyyy.MM.dd', { locale: ko })}
      </span>
    ),
  },
  {
    accessorKey: 'menu',
    header: '',
    size: 50,
    enableSorting: false,
    cell: (cell: any) => <ColumnMenu data={cell.row.original} />,
  },
];
