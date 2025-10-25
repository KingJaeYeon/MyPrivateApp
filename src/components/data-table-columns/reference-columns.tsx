import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import Tip from '@/components/Tip.tsx';
import useTagStore from '@/store/useTagStore.ts';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ReactNode } from 'react';
import IconMoreInfo from '@/assets/svg/IconMoreInfo.tsx';

export type ReferenceColumns = {
  path: string;
  idx: string;
  name: string;
  tag: string;
  link: string;
  memo: string;
  updatedAt: string;
  createdAt: number;
};
export const REFERENCE_COLUMNS: ColumnDef<ReferenceColumns>[] = [
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
    accessorKey: 'name',
    header: () => (
      <span>
        <span className={'mr-1'}>참조명</span>
        <Tip txt={'클릭시 링크이동'} triggerClssName={'translate-y-0.5'}>
          <IconMoreInfo />
        </Tip>
      </span>
    ),
    minSize: 170,
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
        <div className="flex items-center gap-2">
          {renderDepth[depthKey]}
          <Button
            size={'sm'}
            variant={'link'}
            className={'shrink px-0 text-start text-xs font-semibold whitespace-normal'}
            onClick={() => window.electronAPI.openExternal(row.original.link)}
          >
            {row.original.name}
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: 'tag',
    header: '태그',
    minSize: 220,
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
    accessorKey: 'memo',
    header: '메모',
    minSize: 400,
    cell: ({ row }) => (
      <Tip txt={row.original.memo} className="max-w-[600px]" side={'right'}>
        <span className="ellipsisLine2 min-w-[100px] cursor-pointer text-xs break-words whitespace-normal">
          {row.original.memo}
        </span>
      </Tip>
    ),
  },
  {
    accessorKey: 'updatedAt',
    header: '갱신일',
    minSize: 120,
    cell: ({ row }) => (
      <span className="text-xs tabular-nums">
        {format(row.original.updatedAt, 'yyyy.MM.dd', { locale: ko })}
      </span>
    ),
  },
];
