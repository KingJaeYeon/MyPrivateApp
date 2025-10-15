import * as React from 'react';

import { cn } from '@/lib/utils';
import useTableStore from '@/store/tableStore.ts';
import useMeasure from 'react-use-measure';
import { useEffect } from 'react';

const Table = React.forwardRef<HTMLTableElement, React.ComponentProps<'table'>>(
  ({ className, ...props }, ref) => (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        ref={ref}
        data-slot="table"
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.ComponentProps<'thead'>>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      data-slot="table-header"
      className={cn('[&_tr]:border-b', className)}
      {...props}
    />
  )
);
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<HTMLTableSectionElement, React.ComponentProps<'tbody'>>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
);
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.ComponentProps<'tfoot'>>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      data-slot="table-footer"
      className={cn('bg-muted/50 border-t font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  )
);
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<HTMLTableRowElement, React.ComponentProps<'tr'>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      data-slot="table-row"
      className={cn(
        'hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors',
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

function TableHead({ className, headerKey, ...props }: any) {
  const { setHeaderWidth } = useTableStore();
  const [measureRef, { width }] = useMeasure();

  useEffect(() => {
    setHeaderWidth(headerKey, width);
  }, [headerKey, setHeaderWidth, width]);

  return (
    <th
      ref={measureRef}
      data-slot="table-head"
      className={cn(
        'px-3 text-sm text-foreground h-10 py-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  );
}

TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<HTMLTableCellElement, React.ComponentProps<'td'>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      data-slot="table-cell"
      className={cn(
        'px-3.5 whitespace-nowrap py-0.5 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-xs',
        className
      )}
      {...props}
    />
  )
);
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.ComponentProps<'caption'>>(
  ({ className, ...props }, ref) => (
    <caption
      ref={ref}
      data-slot="table-caption"
      className={cn('text-sm text-muted-foreground mt-4', className)}
      {...props}
    />
  )
);
TableCaption.displayName = 'TableCaption';

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
