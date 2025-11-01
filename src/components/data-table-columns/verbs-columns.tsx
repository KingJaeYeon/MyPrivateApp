import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import Tip from '@/components/Tip.tsx';
import type { DBSchema } from '../../../electron/docs.schema.ts';

export type VerbsColumns = DBSchema['verbs'];

export const VERBS_COLUMNS: ColumnDef<VerbsColumns>[] = [
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
    accessorKey: 'word',
    header: '동사',
    minSize: 150,
    cell: ({ row }) => (
      <div className="flex flex-col gap-1 py-1">
        <span className="text-sm font-semibold">{row.original.word || '동사 없음'}</span>
        {row.original.meaning && (
          <span className="text-muted-foreground text-xs">{row.original.meaning}</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'memo',
    header: '메모',
    minSize: 300,
    cell: ({ row }) => (
      <Tip txt={row.original.memo} className="max-w-[600px]" side={'bottom'}>
        <span className="ellipsisLine2 min-w-[100px] cursor-pointer text-xs break-words whitespace-normal">
          {row.original.memo || '메모 없음'}
        </span>
      </Tip>
    ),
  },
  {
    accessorKey: 'patternIds',
    header: '연결된 패턴',
    minSize: 150,
    cell: ({ row }) => {
      const patternIds = Array.isArray(row.original.patternIds) ? row.original.patternIds : [];
      if (patternIds.length === 0) {
        return (
          <Badge variant="destructive" size="sm">
            없음
          </Badge>
        );
      }
      return (
        <div className="flex flex-wrap gap-1 py-1">
          <Badge variant="secondary" size="sm">
            {patternIds.length}개
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'conceptIds',
    header: '연결된 개념',
    minSize: 150,
    cell: ({ row }) => {
      const conceptIds = Array.isArray(row.original.conceptIds) ? row.original.conceptIds : [];
      if (conceptIds.length === 0) {
        return (
          <Badge variant="destructive" size="sm">
            없음
          </Badge>
        );
      }
      return (
        <div className="flex flex-wrap gap-1 py-1">
          <Badge variant="secondary" size="sm">
            {conceptIds.length}개
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: '생성일',
    minSize: 120,
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs">
        {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString('ko-KR') : '-'}
      </span>
    ),
  },
];
