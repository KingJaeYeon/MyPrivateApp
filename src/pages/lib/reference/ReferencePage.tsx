import { DataTable } from '@/components/data-table.tsx';
import { Button } from '@/components/ui/button.tsx';
import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input.tsx';
import { toast } from 'sonner';
import {
  REFERENCE_COLUMNS,
  ReferenceColumns,
} from '@/components/data-table-columns/reference-columns.tsx';
import useReferenceStore from '@/store/useReferenceStore.ts';
import { ReferenceSidePanel } from '@/pages/lib/reference/components/ReferenceSidePanel.tsx';

import TagSelector from '@/components/TagSelector.tsx';
import useTagStore from '@/store/useTagStore.ts';
import { ButtonGroup } from '@/components/ui/button-group.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select.tsx';
import { useModalStore } from '@/store/modalStore.ts';

const FILTER = [
  { label: '참조', value: 'name' },
  { label: '메모', value: 'memo' },
];

export default function ReferencePage() {
  const { getData, saved, isChanged, remove, data, setEdit, setPanelState } = useReferenceStore();
  const { data: tags } = useTagStore();
  const { openModal } = useModalStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [filter, setFilter] = React.useState(FILTER[0]);

  const onSavedHandler = async () => {
    if (confirm('저장하시겠습니까?')) {
      await saved();
      openModal('alert', '저장되었습니다.');
    }
  };

  const reference = useMemo(() => {
    return getData();
  }, [data]);

  const onEditHandler = () => {
    setIsDeleting(true);
    setEdit('initialize');
  };

  const onSelectHandler = (row: ReferenceColumns | null) => {
    if (isDeleting) return;

    if (row === null) {
      setEdit('initialize');
      return;
    }

    setEdit(row);
    setPanelState('isNew', false);
  };

  return (
    <div className="flex h-full w-full flex-1 gap-5 px-4">
      <div className={'flex flex-7'}>
        <DataTable<ReferenceColumns, unknown>
          columns={REFERENCE_COLUMNS}
          data={reference}
          isEdit={isDeleting}
          enableRowClickSelection={true}
          enableMultiRowSelection={isDeleting}
          onSelectedRow={onSelectHandler}
          tableControls={(table) => {
            const onFilterChange = (value: string) => {
              // 이전 필터 값 초기화
              table.getColumn(filter.value)?.setFilterValue('');
              const find = FILTER.find((r) => r.value === value) ?? FILTER[0];
              setFilter(find);
            };
            return (
              <div className={'flex w-full justify-between'}>
                <div className={'flex gap-1'}>
                  <TagSelector
                    value={(table.getColumn('tag')?.getFilterValue() as string) ?? ''}
                    setValue={(tagName) => {
                      const matched = tags.find((t) => t.name === tagName);
                      const tagIdx = matched ? matched.idx : ''; // 없으면 필터 해제
                      table.getColumn('tag')?.setFilterValue(tagIdx);
                    }}
                  />
                  <ButtonGroup>
                    <ButtonGroup>
                      <Select value={filter.value} onValueChange={onFilterChange}>
                        <SelectTrigger className="font-mono" size={'sm'}>
                          {filter.label}
                        </SelectTrigger>
                        <SelectContent className="min-w-18">
                          {FILTER.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              <span className="text-muted-foreground">{currency.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={(table.getColumn(filter.value)?.getFilterValue() as string) ?? ''}
                        onChange={(event) => {
                          return table.getColumn(filter.value)?.setFilterValue(event.target.value);
                        }}
                        className="h-8 w-[170px]"
                      />
                    </ButtonGroup>
                  </ButtonGroup>
                </div>
                <div className={'flex gap-2'}>
                  {isDeleting ? (
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
                          const txt =
                            '정말 삭제하시겠습니까?\n(엑셀 갱신버튼은 따로 눌러야합니다.)';
                          if (!confirm(txt)) return;

                          remove(selected);
                        }}
                      >
                        삭제
                      </Button>
                      <Button
                        variant={'secondary'}
                        size={'sm'}
                        onClick={() => setIsDeleting(false)}
                      >
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
                      <Button size={'sm'} variant={'secondary'} onClick={onEditHandler}>
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
      <ReferenceSidePanel isDeleting={isDeleting} />
    </div>
  );
}
