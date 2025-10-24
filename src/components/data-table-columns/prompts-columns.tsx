import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge.tsx';
import Tip from '@/components/Tip.tsx';
import useTagStore from '@/store/useTagStore.ts';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { toast } from 'sonner';

export type PromptsColumns = {
  idx: string;
  tag: string;
  prompt: string;
  memo: string;
  updatedAt: string;
  createdAt: number;
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success(`Prompt 복사완료`);
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
    accessorKey: 'prompt',
    header: '프롬프트',
    minSize: 400,
    cell: ({ row }) => (
      <Tip txt={row.original.prompt} className="max-w-[600px]" side={'left'}>
        <span
          className="ellipsisLine4 min-w-[100px] cursor-pointer text-xs break-words whitespace-normal"
          onClick={() => copyToClipboard(row.original.prompt)}
        >
          {row.original.prompt}
        </span>
      </Tip>
    ),
  },
  {
    accessorKey: 'memo',
    header: '메모',
    minSize: 200,
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
    minSize: 80,
    cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.updatedAt}</span>,
  },
];
