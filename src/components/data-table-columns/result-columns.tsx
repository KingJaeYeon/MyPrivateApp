import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button.tsx';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const nf = new Intl.NumberFormat();

export type VideoRow = {
  no: number;
  channelId: string;
  tags: string[];
  defaultLanguage: string;
  defaultAudioLanguage: string;
  likeCount: string;
  commentCount: string;
  channelTitle: string;
  title: string;
  publishedAt: string;
  viewCount: number;
  viewsPerHour: number;
  viewsPerSubscriber: number | null;
  duration: string; // 표시용 "mm:ss" or "hh:mm:ss"
  link: string;
  thumbnailUrl: string;
  subscriberCount: number | null; // ✅ 구독자 수
};

export const RESULT_COLUMNS: ColumnDef<VideoRow>[] = [
  {
    accessorKey: 'no',
    header: '#',
    size: 60,
    cell: ({ row }) => <span className="tabular-nums flex justify-center">{row.original.no}</span>,
    enableSorting: true,
  },
  {
    accessorKey: 'thumbnailUrl',
    header: '썸네일',
    size: 90,
    cell: ({ row }) => (
      <img
        src={row.original.thumbnailUrl}
        alt={row.original.title}
        className="h-12 w-20 object-cover rounded cursor-pointer"
        onClick={() => window.electronAPI.openExternal(row.original.thumbnailUrl)}
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'channelTitle',
    header: '채널명',
    cell: ({ row }) => (
      <p
        onClick={() => {
          navigator.clipboard.writeText(row.original.channelTitle);
          toast.success('복사완료');
        }}
        className={'cursor-pointer text-xs break-words whitespace-normal'}
        title={row.original.title}
      >
        {row.original.channelTitle}
      </p>
    ),
  },
  {
    accessorKey: 'title',
    header: '제목',
    cell: ({ row }) => (
      <p
        onClick={() => {
          navigator.clipboard.writeText(row.original.title);
          toast.success('복사완료');
        }}
        className={'cursor-pointer w-[250px] text-xs break-words whitespace-normal'}
        title={row.original.title}
      >
        {row.original.title}
      </p>
    ),
  },
  {
    accessorKey: 'publishedAt',
    header: '업로드일',
    size: 160,
    cell: ({ row }) => {
      const formatD = format(new Date(row.original.publishedAt), 'yyyy-MM-dd a hh:mm:ss', {
        locale: ko,
      });
      return (
        <span className={'text-xs'}>
          <p>{formatD.slice(0, 10)} </p>
          <p>{formatD.slice(11)}</p>
        </span>
      );
    },
  },
  {
    accessorKey: 'viewCount',
    header: '조회수',
    size: 120,
    cell: ({ row }) => (
      <span className="tabular-nums text-xs">{nf.format(row.original.viewCount)}</span>
    ),
  },
  {
    accessorKey: 'viewsPerHour',
    header: '시간당 조회수',
    size: 140,
    cell: ({ row }) => (
      <span className="flex justify-center tabular-nums text-xs">
        {Number(Math.round(row.original.viewsPerHour).toFixed(2))}
      </span>
    ),
  },
  {
    accessorKey: 'subscriberCount', // ✅ 새로 추가
    header: '구독자수',
    size: 140,
    cell: ({ row }) => {
      const v = row.original.subscriberCount;
      return v == null ? '-' : <span className="tabular-nums text-xs">{nf.format(v)}</span>;
    },
  },
  {
    accessorKey: 'viewsPerSubscriber',
    header: '조회수/구독자수',
    size: 150,
    cell: ({ row }) => {
      const v = row.original.viewsPerSubscriber;
      return v == null ? (
        '-'
      ) : (
        <span className="tabular-nums text-xs flex justify-center">{v.toFixed(4)}</span>
      );
    },
  },
  {
    accessorKey: 'duration',
    header: '영상길이',
    size: 110,
    cell: ({ row }) => row.original.duration,
  },
  {
    accessorKey: 'link',
    header: '링크',
    size: 120,
    cell: ({ row }) => (
      <Button
        size="sm"
        variant="secondary"
        onClick={() => window.electronAPI.openExternal(row.original.link)}
      >
        열기
      </Button>
    ),
    enableSorting: false,
  },
];
