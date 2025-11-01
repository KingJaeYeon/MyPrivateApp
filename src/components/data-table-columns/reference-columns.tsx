import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import Tip from '@/components/Tip.tsx';
import useTagStore from '@/store/useTagStore.ts';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import IconMoreInfo from '@/assets/svg/IconMoreInfo.tsx';
import { ReactNode } from 'react';

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

// TODO: 삭제모드일때 체크박스 선택시 하위목록 선택안되는거, 상위목록 지워지면 하위목록에서 상위목록 idx삭제해주는거, 하위목록 숨김처리해주는거
// 그냥 체크박스 내가 커스텀한걸로 하나 만들어야겠음, propmt도 마찬가지로
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
    cell: ({ row }) => {
      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    enableSorting: false,
    header: () => (
      <span>
        <span className={'mr-1'}>참조명</span>
        <Tip txt={'클릭시 링크이동/카테고리'} triggerClssName={'translate-y-0.5'}>
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

          {row.original.link === '' ? (
            <span
              className={
                'shrink px-0 py-2 text-start text-xs font-semibold whitespace-normal text-green-500 has-[>svg]:px-3'
              }
            >
              {row.original.name}
            </span>
          ) : (
            <Button
              size={'sm'}
              variant={'link'}
              className={'shrink px-0 text-start text-xs font-semibold whitespace-normal'}
              onClick={() =>
                row.original.link && window.electronAPI.openExternal(row.original.link)
              }
            >
              {row.original.name}
            </Button>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'tag',
    header: '태그',
    minSize: 170,
    maxSize: 220,
    enableSorting: false,
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
    minSize: 300,
    maxSize: 600,
    enableSorting: false,
    cell: ({ row }) => (
      <Tip
        txt={row.original.memo}
        className="max-w-[600px]"
        side={'right'}
        triggerClssName={'w-full'}
      >
        <span className="ellipsisLine1 pointer-events-none w-full min-w-[100px] cursor-pointer resize-none align-middle text-xs break-words whitespace-pre-line">
          {row.original.memo}
        </span>
      </Tip>
    ),
  },
];
