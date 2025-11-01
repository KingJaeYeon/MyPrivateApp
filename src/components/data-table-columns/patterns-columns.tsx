import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import Tip from '@/components/Tip.tsx';
import type { DBSchema } from '../../../electron/docs.schema.ts';

export type PatternsColumns = DBSchema['patterns'];

export const PATTERNS_COLUMNS: ColumnDef<PatternsColumns>[] = [
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
    accessorKey: 'title',
    header: '패턴명',
    minSize: 200,
    cell: ({ row }) => (
      <div className="flex flex-col gap-1 py-1">
        <span className="text-sm font-semibold">{row.original.title || '제목 없음'}</span>
        <Tip txt={row.original.structure} className="max-w-[600px]" side={'bottom'}>
          <span className="text-muted-foreground ellipsisLine1 cursor-pointer text-xs font-mono">
            {row.original.structure}
          </span>
        </Tip>
      </div>
    ),
  },
  {
    accessorKey: 'description',
    header: '설명',
    minSize: 300,
    cell: ({ row }) => (
      <Tip txt={row.original.description} className="max-w-[600px]" side={'bottom'}>
        <span className="ellipsisLine2 min-w-[100px] cursor-pointer text-xs break-words whitespace-normal">
          {row.original.description || '설명 없음'}
        </span>
      </Tip>
    ),
  },
  {
    accessorKey: 'examples',
    header: '예문',
    minSize: 250,
    cell: ({ row }) => {
      const examples = Array.isArray(row.original.examples) ? row.original.examples : [];
      if (examples.length === 0) {
        return (
          <Badge variant="destructive" size="sm">
            예문 없음
          </Badge>
        );
      }
      return (
        <div className="flex flex-col gap-1 py-1">
          {examples.slice(0, 2).map((example, idx) => (
            <span key={idx} className="text-muted-foreground text-xs italic">
              • {example}
            </span>
          ))}
          {examples.length > 2 && (
            <span className="text-muted-foreground text-xs">+{examples.length - 2}개 더...</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'verbIds',
    header: '연결된 동사',
    minSize: 150,
    cell: ({ row }) => {
      const verbIds = Array.isArray(row.original.verbIds) ? row.original.verbIds : [];
      if (verbIds.length === 0) {
        return (
          <Badge variant="destructive" size="sm">
            없음
          </Badge>
        );
      }
      return (
        <div className="flex flex-wrap gap-1 py-1">
          <Badge variant="secondary" size="sm">
            {verbIds.length}개
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
