import { DataTable } from '@/components/data-table.tsx';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button.tsx';
import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input.tsx';
import { toast } from 'sonner';
import {
  REFERENCE_COLUMNS,
  ReferenceColumns,
} from '@/components/data-table-columns/reference-columns.tsx';
import useReferenceStore from '@/store/useReferenceStore.ts';
import { AddReference } from '@/pages/reference/components/AddReference.tsx';

export default function ReferencePage() {
  const { data, saved, isChanged } = useReferenceStore();
  const [isEdit, setEdit] = useState(false);

  const columns = REFERENCE_COLUMNS;

  const onSavedHandler = async () => {
    if (confirm('저장하시겠습니까?')) {
      await saved();
      alert('저장되었습니다.');
    }
  };

  return (
    <div className="flex w-full flex-1 gap-5 px-4">
      <div className={'flex flex-7'}>
        <DataTable<ReferenceColumns, unknown>
          columns={REFERENCE_COLUMNS}
          data={data}
          tableControls={(table) => {
            return (
              <div className={'flex w-full justify-between'}>
                <div className={'flex gap-1'}>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="outline" className="ml-auto" size={'sm'}>
                        Tag
                        <ChevronDown />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {table
                        .getAllColumns()
                        .filter((column) => column.getCanHide())
                        .map((column) => {
                          return (
                            <DropdownMenuCheckboxItem
                              key={column.id}
                              className="capitalize"
                              checked={column.getIsVisible()}
                              onCheckedChange={(value) => column.toggleVisibility(!!value)}
                            >
                              {column.id}
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Input
                    placeholder="Search Idx..."
                    value={(table.getColumn('idx')?.getFilterValue() as string) ?? ''}
                    onChange={(event) => {
                      console.log(table.getColumn('idx'));
                      return table.getColumn('idx')?.setFilterValue(event.target.value);
                    }}
                    className="h-8 w-[130px]"
                  />
                  <Input
                    placeholder="Search Tag..."
                    value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) => {
                      console.log(table.getColumn('name'));
                      return table.getColumn('name')?.setFilterValue(event.target.value);
                    }}
                    className="h-8 w-[200px]"
                  />
                </div>
                <div className={'flex gap-2'}>
                  {isEdit ? (
                    <React.Fragment>
                      <Button
                        size={'sm'}
                        variant={'destructive'}
                        onClick={() => {
                          const selected = table.getSelectedRowModel().rows.map((r) => r.original);
                          if (selected.length === 0) {
                            toast.error('삭제할 항목을 선택하세요.');
                            return;
                          }
                          // removeTags(selected);
                        }}
                      >
                        삭제
                      </Button>
                      <Button variant={'secondary'} size={'sm'} onClick={() => setEdit(false)}>
                        취소
                      </Button>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <Button
                        size={'sm'}
                        onClick={onSavedHandler}
                        variant={isChanged ? 'destructive' : 'default'}
                      >
                        저장
                      </Button>
                      <Button size={'sm'} variant={'secondary'} onClick={() => setEdit(true)}>
                        수정
                      </Button>
                    </React.Fragment>
                  )}
                </div>
              </div>
            );
          }}
        />
      </div>
      <AddReference />
    </div>
  );
}
