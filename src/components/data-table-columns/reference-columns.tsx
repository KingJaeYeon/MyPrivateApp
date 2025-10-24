import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import Tip from '@/components/Tip.tsx';
import useTagStore from '@/store/useTagStore.ts';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { IconOutLink } from '@/assets/svg';

export type ReferenceColumns = {
  parentIdx: number;
  idx: number;
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
    header: '참조명',
    minSize: 150,
    cell: ({ row }) => <p className="font-bold whitespace-break-spaces">{row.original.name}</p>,
  },
  {
    accessorKey: 'tag',
    header: '태그',
    minSize: 200,
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
      <Tip txt={row.original.memo} className="max-w-[600px]" side={'left'}>
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
    cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.updatedAt}</span>,
  },
  {
    accessorKey: 'link',
    header: '링크',
    maxSize: 80,
    enableSorting: false,
    cell: ({ row }) => (
      <Button
        size="icon-sm"
        variant="secondary"
        onClick={() => window.electronAPI.openExternal(row.original.link)}
      >
        <IconOutLink />
      </Button>
    ),
  },
  {
    accessorKey: 'parentIdx',
    header: 'parentIdx',
    sortingFn: (a, b) => {
      const da = a.getValue('parentIdx') as number;
      const db = b.getValue('parentIdx') as number;
      return da - db;
    },
  },
];
