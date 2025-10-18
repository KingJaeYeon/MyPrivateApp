import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button.tsx';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import Tip from '@/components/Tip.tsx';
import { formatCompactNumber } from '@/lib/utils.ts';
import { Badge } from '@/components/ui/badge.tsx';

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
  // 표시용 "mm:ss" or "hh:mm:ss"
  duration: string;
  link: string;
  thumbnailUrl: string;
  // ✅ 구독자 수
  subscriberCount: number | null;
};

export const RESULT_COLUMNS: ColumnDef<VideoRow>[] = [
  {
    id: 'no',
    accessorKey: 'no',
    maxSize: 30,
    header: '#',
    cell: ({ row }) => <span className="tabular-nums">{row.original.no}</span>,
    enableSorting: true,
  },
  {
    accessorKey: 'thumbnailUrl',
    header: '썸네일',
    maxSize: 65,
    cell: ({ row }) => (
      <img
        src={row.original.thumbnailUrl}
        alt={row.original.title}
        className="h-12 w-20 cursor-pointer rounded object-cover"
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
        className={'cursor-pointer break-words whitespace-normal'}
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
        className={'w-[250px] cursor-pointer break-words whitespace-normal'}
        title={row.original.title}
      >
        {row.original.title}
      </p>
    ),
  },
  {
    accessorKey: 'tags',
    header: '태그',
    maxSize: 60,
    cell: ({ row }) => {
      const tags = row.original.tags ?? [];

      if (tags.length === 0) {
        return <span>-</span>;
      }

      return (
        <Tip txt={tags.join(',')} className={'w-[200px]'}>
          {tags.slice(0, 1).map((tag) => (
            <Badge variant={'secondary'} size={'sm'}>
              {tag}
            </Badge>
          ))}
        </Tip>
      );
    },
  },
  {
    accessorKey: 'viewCount',
    header: '조회수',
    maxSize: 120,
    cell: ({ row }) => <span className="tabular-nums">{nf.format(row.original.viewCount)}</span>,
  },
  {
    accessorKey: 'viewsPerHour',
    meta: '시간당 조회수',
    maxSize: 65,
    header: () => (
      <Tip txt={'시간당 조회수'} className={'z-[1000]'} color={'red'}>
        VPH
      </Tip>
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">{nf.format(Math.round(row.original.viewsPerHour))}</span>
    ),
  },
  {
    accessorKey: 'subscriberCount', // ✅ 새로 추가
    header: '구독자수',
    maxSize: 65,
    cell: ({ row }) => {
      const v = row.original.subscriberCount;
      return v == null ? '-' : <span className="tabular-nums">{formatCompactNumber(v)}</span>;
    },
  },
  {
    accessorKey: 'viewsPerSubscriber',
    meta: '조회수/구독자수',
    header: () => (
      <Tip txt={'조회수/구독자수'} className={'z-[1000]'} color={'red'}>
        VPS
      </Tip>
    ),
    maxSize: 65,
    cell: ({ row }) => {
      const v = row.original.viewsPerSubscriber;
      return v == null ? '-' : <span className="tabular-nums">{v.toFixed(2)}</span>;
    },
  },
  {
    accessorKey: 'publishedAt',
    header: '업로드일',
    maxSize: 130,
    cell: ({ row }) => {
      const formatD = format(new Date(row.original.publishedAt), 'yyyy-MM-dd a hh:mm:ss', {
        locale: ko,
      });
      return (
        <span>
          <p className={'w-fit'}>{formatD.slice(0, 10)} </p>
          <p className={'w-fit'}>{formatD.slice(11)}</p>
        </span>
      );
    },
  },
  {
    accessorKey: 'likeCount',
    header: '좋아요',
    maxSize: 65,
    cell: ({ row }) => (
      <span className="tabular-nums">{formatCompactNumber(Number(row.original.likeCount))}</span>
    ),
  },
  {
    accessorKey: 'commentCount',
    header: '댓글수',
    maxSize: 65,
    cell: ({ row }) => (
      <span className="tabular-nums">{formatCompactNumber(Number(row.original.commentCount))}</span>
    ),
  },
  {
    accessorKey: 'duration',
    header: '영상길이',
    maxSize: 65,
    cell: ({ row }) => <span className="tabular-nums">{row.original.duration}</span>,
  },
  {
    accessorKey: 'defaultAudioLanguage',
    header: () => (
      <Tip txt={'기본/오디오'} className={'z-[1000]'}>
        언어
      </Tip>
    ),
    meta: '언어',
    maxSize: 65,
    cell: ({ row }) => (
      <span>
        <p>{row.original.defaultLanguage}</p>
        <p>{row.original.defaultAudioLanguage}</p>
      </span>
    ),
  },
  {
    accessorKey: 'link',
    header: '링크',
    maxSize: 65,
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
