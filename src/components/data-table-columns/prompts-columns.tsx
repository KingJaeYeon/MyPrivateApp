import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge.tsx';
import Tip from '@/components/Tip.tsx';
import useTagStore from '@/store/useTagStore.ts';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { ReactNode } from 'react';

export type PromptsColumns = {
  path: string;
  title: string;
  idx: string;
  tag: string;
  prompt: string;
  memo: string;
  updatedAt: string;
  createdAt: number;
};

export const PROMPTS_COLUMNS: ColumnDef<PromptsColumns>[] = [
  {
    id: 'select',
    size: 40,
    maxSize: 40,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'tag',
    header: '태그',
    minSize: 100,
    cell: ({ row }) => {
      const tagsJSON = useTagStore.getState().jsonData;
      const cur = row?.original?.tag?.toString().split(',');
      return (
        <div className="flex flex-wrap gap-1 py-1">
          {cur[0] === '' ? (
            <Badge variant="destructive" key={'none'} size="sm">
              N/A
            </Badge>
          ) : (
            cur.map((tag) => (
              <Badge variant="green" key={tag} size="sm">
                {tagsJSON?.[tag]}
              </Badge>
            ))
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'title',
    header: '프롬프트',
    minSize: 300,
    cell: ({ row }) => {
      type DepthKey = 'one' | 'two' | 'three' | 'four' | 'other';

      const renderDepth: Record<DepthKey, ReactNode> = {
        one: <span className="min-h-1.5 min-w-1.5 animate-pulse rounded-full bg-green-500" />,
        two: <span className="ml-1 min-h-1.5 min-w-1.5 animate-pulse rounded-full bg-yellow-500" />,
        three: (
          <span className="bg-destructive ml-2 min-h-1.5 min-w-1.5 animate-pulse rounded-full" />
        ),
        four: (
          <span className="ml-3 min-h-1.5 min-w-1.5 animate-pulse rounded-full bg-purple-600" />
        ),
        other: <span className="ml-4 min-h-1.5 min-w-1.5 animate-pulse rounded-full bg-blue-400" />,
      };

      const depthCount = row.original.path.split('/').length;
      const depthKey: DepthKey =
        depthCount === 1
          ? 'one'
          : depthCount === 2
            ? 'two'
            : depthCount === 3
              ? 'three'
              : depthCount === 4
                ? 'four'
                : 'other';

      return (
        <div className="flex items-start gap-2 py-1">
          <div className={'flex h-5 items-center'}>{renderDepth[depthKey]}</div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-sm font-medium">{row.original.title || '제목 없음'}</span>
            <Tip txt={row.original.prompt} className="max-w-[600px]" side={'bottom'}>
              <span className="ellipsisLine2 text-muted-foreground cursor-pointer text-xs break-words whitespace-normal">
                {row.original.prompt}
              </span>
            </Tip>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'memo',
    header: '메모',
    minSize: 100,
    cell: ({ row }) => (
      <Tip txt={row.original.memo} className="max-w-[600px]" side={'bottom'}>
        <span className="ellipsisLine1 min-w-[100px] cursor-pointer text-xs break-words whitespace-normal">
          {row.original.memo}
        </span>
      </Tip>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: '생성일',
    sortingFn: (a, b) => {
      const da = new Date(a.getValue('createdAt')).getTime();
      const db = new Date(b.getValue('createdAt')).getTime();
      return da - db;
    },
  },
];
