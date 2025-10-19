// src/components/data-table.tsx
import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type ColumnDef,
  type Table as typeTable,
  getFilteredRowModel,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ReactNode, useEffect, useRef, useState } from 'react';
import useMeasure from 'react-use-measure';
import useTableStore from '@/store/useTableStore.ts';
import { cn, FontSize } from '@/lib/utils.ts';
import { useSpring, animated } from '@react-spring/web';
import useSyncScroll from '@/hooks/useSyncScroll.ts';

type Props<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  tableControls?: (table: typeTable<TData>) => ReactNode;
  onClickRow?: (row: TData) => void;
  // No column 간격 css 수정
  hasNo?: boolean;
  isFixHeader?: boolean;
  name?: string;
  fontSize?: { head?: FontSize; cell?: FontSize };
  isEdit?: boolean; // checkBox 해제용
};
/*** 테스트
 **/
export function DataTable<TData, TValue>({
  columns,
  data,
  isFixHeader = false,
  name = 'default',
  tableControls,
  onClickRow,
  hasNo,
  fontSize,
  isEdit,
}: Props<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [ref, { y, height }] = useMeasure();
  const tableMeasure = useMeasure();
  const headerRef = useRef<HTMLTableElement | null>(null);
  const [headerTop, setHeaderTop] = useState(0);

  // ── 테이블 모델(페이지네이션 제거 = getPaginationRowModel 제거) ──
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableMultiSort: true, // ✅ 다중 정렬 허용
    getFilteredRowModel: getFilteredRowModel(),
    defaultColumn: {
      size: 80, // 기본 폭
      minSize: 20, // 최소 폭
      maxSize: 600, // 필요시
    },
  });

  const { setTriggerHeight, getTriggerHeight, getHeaderWidth } = useTableStore();
  const [isFixedHeader, setIsFixedHeader] = useState(false);
  const props = useSpring({
    opacity: isFixedHeader ? 1 : 0,
    height: isFixedHeader ? height + 10 : 0,
  });
  const [ref1, ref2] = useSyncScroll(isFixedHeader);

  useEffect(() => {
    if (isFixHeader === false || !ref1.current) {
      return;
    }
    const triggerHeight = getTriggerHeight(name);

    if (triggerHeight === undefined || triggerHeight === 0) {
      setTriggerHeight(ref1.current.offsetTop, name);
    }
  }, [getTriggerHeight, isFixHeader, name, ref1, setTriggerHeight, y]);

  // TableHeader의 위치 측정
  useEffect(() => {
    if (!headerRef.current) return;

    const top = headerRef.current.getBoundingClientRect().top + window.scrollY;
    setHeaderTop(top);
  }, []);

  useEffect(() => {
    const scrollContainer = ref1.current;
    if (!scrollContainer) return;

    function handleScroll() {
      const currentScrollY = scrollContainer.scrollTop; // window.scrollY 대신 scrollTop 사용
      const triggerHeight = getTriggerHeight(name);

      if (triggerHeight > currentScrollY) {
        setIsFixedHeader(false);
      } else {
        setIsFixedHeader(true);
      }
    }

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [getTriggerHeight, name, ref1]);

  useEffect(() => {
    return () => {
      setTriggerHeight(0, name);
    };
  }, [name, setTriggerHeight]);

  useEffect(() => {
    if (!isEdit) {
      table.setRowSelection({});
    }
  }, [isEdit]);

  return (
    <div className="flex flex-1 flex-col space-y-2">
      {/* 스크롤 컨테이너 */}
      <div className={'text-muted-foreground flex w-full flex-col gap-1 text-sm'}>
        {tableControls && tableControls(table)}
        {/*    정렬 표시*/}
        {sorting.length > 0 && (
          <div className={'flex gap-2'}>
            정렬:
            {sorting.map((s, i) => {
              const col = table.getColumn(s.id);
              if (!col) return null;
              const def = col.columnDef;
              const rendered = typeof def.header === 'function' ? def.meta : def.header;

              const dir = s.desc ? '▼' : '▲';
              return (
                <span key={s.id}>
                  {i > 0 && <span className={'mr-1'}>, </span>}
                  {rendered?.toString()} {dir} ({i + 1})
                </span>
              );
            })}
          </div>
        )}
      </div>
      <div
        className={'scrollWidth3 relative flex w-full flex-1 overflow-x-auto rounded-md border'}
        ref={ref1}
      >
        <div className={'w-full'} ref={tableMeasure[0]}>
          {isFixHeader && isFixedHeader && (
            <animated.div
              className={'bg-background fixed z-[50] flex flex-row border-b-2'}
              style={{
                ...props,
                top: `${headerTop - 2}px`,
              }}
            >
              <div
                className={'scrollNone hover:bg-muted/50 flex overflow-auto'}
                ref={ref2}
                style={{
                  width: tableMeasure[1].width,
                }}
              >
                {table.getHeaderGroups().map((headerGroup) => (
                  <div className={'flex'} key={headerGroup.id}>
                    {headerGroup.headers.map((h) => {
                      const canSort = h.column.getCanSort?.() ?? false;
                      const sortDir = h.column.getIsSorted?.(); // false | 'asc' | 'desc'
                      const onClick = h.column.getToggleSortingHandler?.();
                      return (
                        <div
                          key={name + h.id}
                          className={cn(
                            `flex text-left align-middle font-medium whitespace-nowrap`,
                            canSort && 'cursor-pointer select-none',
                            hasNo && h.id === 'no' && 'pr-0'
                          )}
                        >
                          <div
                            onClick={canSort ? onClick : undefined}
                            className={cn(
                              'flex items-center justify-start text-center text-sm',
                              fontSize?.head && fontSize.head
                            )}
                            style={{
                              width: getHeaderWidth(`${name}-${h.id}`),
                            }}
                          >
                            <span className="px-1.5 text-center">
                              {h.isPlaceholder
                                ? null
                                : flexRender(h.column.columnDef.header, h.getContext())}
                              {canSort && (
                                <span className="text-muted-foreground ml-1">
                                  {sortDir === 'asc' ? '▲' : sortDir === 'desc' ? '▼' : ''}
                                  {/* ✅ 다중 정렬 순위 표시 */}
                                  {h.column.getSortIndex() !== -1 && (
                                    <span className="text-xs">{h.column.getSortIndex() + 1}</span>
                                  )}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </animated.div>
          )}
          <div className="flex flex-1 overflow-auto">
            <div className="absolute top-0 left-0 h-full w-full">
              <Table className="relative" ref={headerRef}>
                <TableHeader className="bg-background z-10" ref={ref}>
                  {table.getHeaderGroups().map((hg) => (
                    <TableRow key={hg.id}>
                      {hg.headers.map((h) => {
                        const canSort = h.column.getCanSort?.() ?? false;
                        const sortDir = h.column.getIsSorted?.(); // false | 'asc' | 'desc'
                        const onClick = h.column.getToggleSortingHandler?.();
                        return (
                          <TableHead
                            key={h.id}
                            headerKey={`${name}-${h.id}`}
                            onClick={canSort ? onClick : undefined}
                            className={cn(
                              canSort ? 'cursor-pointer select-none' : '',
                              hasNo && h.id === 'no' && 'pr-0',
                              fontSize?.head && fontSize.head
                            )}
                            aria-sort={
                              sortDir === false
                                ? 'none'
                                : sortDir === 'asc'
                                  ? 'ascending'
                                  : 'descending'
                            }
                          >
                            <span className="text-center">
                              {h.isPlaceholder
                                ? null
                                : flexRender(h.column.columnDef.header, h.getContext())}
                              {canSort && (
                                <span className="text-muted-foreground ml-1">
                                  {sortDir === 'asc' ? '▲' : sortDir === 'desc' ? '▼' : ''}
                                  {/* ✅ 다중 정렬 순위 표시 */}
                                  {h.column.getSortIndex() !== -1 && (
                                    <span className="text-xs text-gray-400">
                                      {h.column.getSortIndex() + 1}
                                    </span>
                                  )}
                                </span>
                              )}
                            </span>
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>

                <TableBody>
                  {table.getRowModel().rows.length ? (
                    <>
                      {table.getRowModel().rows.map((r) => (
                        <TableRow
                          key={r.id}
                          data-state={r.getIsSelected() && 'selected'}
                          onClick={onClickRow ? () => onClickRow(r.original) : undefined}
                          className={cn(onClickRow ? 'hover:cursor-pointer' : undefined)}
                        >
                          {r.getVisibleCells().map((c) => (
                            <TableCell
                              key={c.id}
                              className={cn(
                                hasNo && c.column.columnDef.id === `no` && 'pr-0',
                                fontSize?.cell && fontSize.cell
                              )}
                              style={{
                                width: c.column.columnDef.size,
                                maxWidth: c.column.columnDef.maxSize,
                                minWidth: c.column.columnDef.minSize,
                              }}
                            >
                              {flexRender(c.column.columnDef.cell, c.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className={'h-24 text-center'}>
                        결과 없음
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
