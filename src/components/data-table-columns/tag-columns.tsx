import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox.tsx';

const nf = new Intl.NumberFormat();

export type TagColumns = {
  idx: string;
  name: string;
  usedChannels: number;
  usedVideos: number;
  usedReference: number;
  usedPrompts: number;
  total: number;
};

export const TAG_COLUMNS: ColumnDef<TagColumns>[] = [
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
    accessorKey: 'idx',
    header: 'idx',
    cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.idx}</span>,
  },
  {
    accessorKey: 'name',
    header: '태그명',
    cell: ({ row }) => (
      <div
        onClick={() => {
          navigator.clipboard.writeText(row.original.name);
          toast.success('복사완료');
        }}
        className={'cursor-pointer text-xs break-words whitespace-normal text-green-500'}
      >
        {row.original.name}
      </div>
    ),
  },
  {
    accessorKey: 'usedChannels',
    header: '채널',
    cell: ({ row }) => (
      <p className={'cursor-pointer text-xs break-words whitespace-normal'}>
        {row.original.usedChannels}
      </p>
    ),
  },
  {
    accessorKey: 'usedVideos',
    header: '동영상',
    cell: ({ row }) => (
      <p className={'cursor-pointer text-xs break-words whitespace-normal'}>
        {row.original.usedVideos}
      </p>
    ),
  },
  {
    accessorKey: 'usedReference',
    header: '레퍼런스',
    cell: ({ row }) => (
      <p className={'cursor-pointer text-xs break-words whitespace-normal'}>
        {row.original.usedReference}
      </p>
    ),
  },
  {
    accessorKey: 'usedPrompts',
    header: '프롬프트',
    cell: ({ row }) => (
      <p className={'cursor-pointer text-xs break-words whitespace-normal'}>
        {row.original.usedPrompts}
      </p>
    ),
  },
  {
    accessorKey: 'total',
    header: '전체수',
    size: 120,
    cell: ({ row }) => (
      <span className="text-xs tabular-nums">{nf.format(row.original.total)}</span>
    ),
  },
];
