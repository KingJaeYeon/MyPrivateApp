import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import Tip from '@/components/Tip.tsx';
import type { DBSchema } from '../../../electron/docs.schema.ts';

export type ExpressionsColumns = DBSchema['expressions'];

export const EXPRESSIONS_COLUMNS: ColumnDef<ExpressionsColumns>[] = [
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
    accessorKey: 'text',
    header: '예문',
    minSize: 250,
    cell: ({ row }) => (
      <div className="flex flex-col gap-1 py-1">
        <span className="text-sm font-semibold">{row.original.text || '예문 없음'}</span>
        {row.original.meaning && (
          <span className="text-muted-foreground text-xs italic">→ {row.original.meaning}</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'importance',
    header: '중요도',
    minSize: 100,
    cell: ({ row }) => {
      const importance = row.original.importance || '';
      return (
        <Badge
          variant={importance === 'high' ? 'destructive' : importance === 'medium' ? 'secondary' : 'outline'}
          size="sm"
        >
          {importance || 'N/A'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'memo',
    header: '메모',
    minSize: 200,
    cell: ({ row }) => (
      <Tip txt={row.original.memo} className="max-w-[600px]" side={'bottom'}>
        <span className="ellipsisLine2 min-w-[100px] cursor-pointer text-xs break-words whitespace-normal">
          {row.original.memo || '메모 없음'}
        </span>
      </Tip>
    ),
  },
  {
    accessorKey: 'linkedPatterns',
    header: '연결된 패턴',
    minSize: 150,
    cell: ({ row }) => {
      const linkedPatterns = Array.isArray(row.original.linkedPatterns) ? row.original.linkedPatterns : [];
      if (linkedPatterns.length === 0) {
        return (
          <Badge variant="destructive" size="sm">
            없음
          </Badge>
        );
      }
      return (
        <div className="flex flex-wrap gap-1 py-1">
          <Badge variant="secondary" size="sm">
            {linkedPatterns.length}개
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'linkedVerbs',
    header: '연결된 동사',
    minSize: 150,
    cell: ({ row }) => {
      const linkedVerbs = Array.isArray(row.original.linkedVerbs) ? row.original.linkedVerbs : [];
      if (linkedVerbs.length === 0) {
        return (
          <Badge variant="destructive" size="sm">
            없음
          </Badge>
        );
      }
      return (
        <div className="flex flex-wrap gap-1 py-1">
          <Badge variant="secondary" size="sm">
            {linkedVerbs.length}개
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'linkedConcepts',
    header: '연결된 개념',
    minSize: 150,
    cell: ({ row }) => {
      const linkedConcepts = Array.isArray(row.original.linkedConcepts) ? row.original.linkedConcepts : [];
      if (linkedConcepts.length === 0) {
        return (
          <Badge variant="destructive" size="sm">
            없음
          </Badge>
        );
      }
      return (
        <div className="flex flex-wrap gap-1 py-1">
          <Badge variant="secondary" size="sm">
            {linkedConcepts.length}개
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
