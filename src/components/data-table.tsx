// src/components/data-table.tsx
import * as React from 'react';
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
    type ColumnDef,
    type Table as typeTable
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {ReactNode} from "react";

type Props<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    initialChunk?: number; // 초기 렌더 개수 (기본 50)
    chunk?: number; // 스크롤마다 추가 로드 개수 (기본 50)
    rootMargin?: string; // 센티널 옵저버 여유 영역 (기본 "300px")
    tableControls?: (table: typeTable<TData>) => ReactNode
};

export function DataTable<TData, TValue>(
    {
        columns,
        data,
        initialChunk = 50,
        chunk = 50,
        rootMargin = '300px',
        tableControls,
    }: Props<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);

    // ── 테이블 모델(페이지네이션 제거 = getPaginationRowModel 제거) ──
    const table = useReactTable({
        data,
        columns,
        state: {sorting},
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        enableMultiSort: true, // ✅ 다중 정렬 허용
    });

    // ── 무한 스크롤: 보이는 행 개수 관리 ──────────────────────────
    const [visibleCount, setVisibleCount] = React.useState(initialChunk);
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const sentinelRef = React.useRef<HTMLDivElement | null>(null);

    // IntersectionObserver로 센티널이 보이면 more 로드
    React.useEffect(() => {
        if (!containerRef.current || !sentinelRef.current) return;

        const root = containerRef.current;
        const sentinel = sentinelRef.current;

        const onIntersect: IntersectionObserverCallback = (entries) => {
            const entry = entries[0];
            if (!entry.isIntersecting) return;

            // 더 로드할 게 남아있을 때만 증가
            const total = table.getRowModel().rows.length;
            if (visibleCount < total) {
                setVisibleCount((prev) => Math.min(prev + chunk, total));
            }
        };

        const observer = new IntersectionObserver(onIntersect, {
            root,
            rootMargin, // 여유를 두고 미리 로드
            threshold: 0.0,
        });

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [table, visibleCount, chunk, rootMargin]);

    // 현재 렌더할 행들
    const allRows = table.getRowModel().rows;
    const rowsToRender = allRows.slice(0, visibleCount);

    return (
        <div className="space-y-2 flex flex-1 flex-col">
            {/* 스크롤 컨테이너 */}
            <div id={'info bar'} className="flex items-center mb-1 sticky top-0 bg-background z-20 gap-3">
                {tableControls && tableControls(table)}
                {/*    정렬 표시*/}
                {sorting.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                        정렬:{' '}
                        {sorting.map((s, i) => {
                            const col = table.getColumn(s.id);
                            if (!col) return null;
                            const dir = s.desc ? '▼' : '▲';
                            return (
                                <span key={s.id}>
                  {i > 0 && ', '}
                                    {col.columnDef.header?.toString()} {dir} ({i + 1})
                </span>
                            );
                        })}
                    </div>
                )}
            </div>
            <div ref={containerRef} className="overflow-auto relative flex flex-1 scrollWidth3">
                <div className="rounded-md border w-full h-full absolute top-0 left-0 ">
                    <Table className="relative ">
                        <TableHeader className="sticky top-0 bg-background z-10">
                            {table.getHeaderGroups().map((hg) => (
                                <TableRow key={hg.id}>
                                    {hg.headers.map((h) => {
                                        const canSort = h.column.getCanSort?.() ?? false;
                                        const sortDir = h.column.getIsSorted?.(); // false | 'asc' | 'desc'
                                        const onClick = h.column.getToggleSortingHandler?.();
                                        return (
                                            <TableHead
                                                key={h.id}
                                                colSpan={h.colSpan}
                                                style={{width: h.getSize() || undefined}}
                                                onClick={canSort ? onClick : undefined}
                                                className={`px-3 py-2 text-sm font-medium ${
                                                    canSort ? 'cursor-pointer select-none' : ''
                                                }`}
                                                aria-sort={
                                                    sortDir === false
                                                        ? 'none'
                                                        : sortDir === 'asc'
                                                            ? 'ascending'
                                                            : 'descending'
                                                }
                                            >
                        <span className="inline-flex items-center gap-1">
                          {h.isPlaceholder
                              ? null
                              : flexRender(h.column.columnDef.header, h.getContext())}
                            {canSort && (
                                <span className="text-muted-foreground flex items-center gap-1">
                              {sortDir === 'asc' ? '▲' : sortDir === 'desc' ? '▼' : '↕'}
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
                            {rowsToRender.length ? (
                                <>
                                    {rowsToRender.map((r) => (
                                        <TableRow key={r.id} data-state={r.getIsSelected() && 'selected'}>
                                            {r.getVisibleCells().map((c) => (
                                                <TableCell key={c.id}>
                                                    {flexRender(c.column.columnDef.cell, c.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}

                                    {/* 센티널: 끝에 도달하면 더 로드 */}
                                    <TableRow>
                                        <TableCell colSpan={columns.length}>
                                            <div ref={sentinelRef} className="h-8 w-full"/>
                                        </TableCell>
                                    </TableRow>
                                </>
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        결과 없음
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
