import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import Tip from '@/components/Tip.tsx';
import useTagStore from '@/store/useTagStore.ts';
import { Checkbox } from '@/components/ui/checkbox.tsx';

export type ReferenceColumns = {
  name: string;
  tag: string;
  link: string;
  memo: string;
  updatedAt: string;
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
    maxSize: 150,
    cell: ({ row }) => <p className="font-bold whitespace-break-spaces">{row.original.name}</p>,
  },
  {
    accessorKey: 'tag',
    header: '태그',
    maxSize: 200,
    cell: ({ row }) => {
      const tags = useTagStore.getState().jsonData;
      return (
        <div className="flex flex-wrap gap-1">
          {row.original.tag.split(',').map((tag) => (
            <Badge variant="green" key={tag} size="sm">
              {tags[tag]}
            </Badge>
          ))}
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
    header: '갱신날짜',
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
        size="sm"
        variant="secondary"
        onClick={() => window.electronAPI.openExternal(row.original.link)}
      >
        열기
      </Button>
    ),
  },
];
export const REFERENCE_COLUMNS2 = (isEdit: boolean): ColumnDef<ReferenceColumns>[] => {
  const cols: ColumnDef<ReferenceColumns>[] = [];
  cols.push(
    {
      id: 'select',
      size: 40,
      maxSize: 40,
      header: ({ table }) => {
        return isEdit ? (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ) : (
          <div className={'px-1'} />
        );
      },
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          disabled={!isEdit}
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
      cell: ({ row }) => <p className="font-bold whitespace-break-spaces">{row.original.name}</p>,
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
      accessorKey: 'memo',
      header: '메모',
      maxSize: 400,
      minSize: 300,
      cell: ({ row }) => (
        <Tip txt={row.original.memo} className="max-w-[400px]">
          <span className="ellipsisLine2 max-w-[300px] min-w-[100px] cursor-pointer text-xs break-words whitespace-normal">
            {row.original.memo}
          </span>
        </Tip>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: '갱신날짜',
      maxSize: 120,
      cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.updatedAt}</span>,
    },
    {
      accessorKey: 'link',
      header: '링크',
      maxSize: 80,
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
    }
  );

  return cols;
};
