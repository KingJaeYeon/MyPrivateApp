import { DataTable } from '@/components/data-table.tsx';
import { Button } from '@/components/ui/button.tsx';
import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input.tsx';
import { toast } from 'sonner';
import { ButtonGroup } from '@/components/ui/button-group.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select.tsx';
import useEnglishStore from '@/store/useEnglishStore.ts';
import {
  PATTERNS_COLUMNS,
  PatternsColumns,
} from '@/components/data-table-columns/patterns-columns.tsx';
import { PatternsSidePanel } from '@/pages/english/components/PatternsSidePanel.tsx';
import { useModalStore } from '@/store/modalStore.ts';
import useSettingStore from '@/store/useSettingStore.ts';

const FILTER = [
  { label: '패턴명', value: 'title' },
  { label: '설명', value: 'description' },
  { label: '구조', value: 'structure' },
];

export default function PatternsPage() {
  const {
    getData,
    saved,
    isChanged,
    remove,
    setEdit,
    setPanelState,
    patterns: data,
  } = useEnglishStore();
  const { openModal } = useModalStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [filter, setFilter] = React.useState(FILTER[0]);
  const { location, name } = useSettingStore((s) => s.data.folder);

  // 페이지 마운트 시 patterns 데이터 초기화
  useEffect(() => {
    if (location && name.patterns) {
      useEnglishStore.getState().init('patterns', `${location}/${name.patterns}`);
    }
  }, [location, name.patterns]);

  // patterns 데이터 가져오기
  const patterns = useMemo(() => {
    return getData('patterns') as PatternsColumns[];
  }, [data]);

  const onSavedHandler = async () => {
    if (confirm('저장하시겠습니까?')) {
      await saved('patterns');
      openModal('alert', '저장되었습니다.');
    }
  };

  const onEditHandler = () => {
    setIsDeleting(true);
    setEdit('patterns', 'initialize');
  };

  const onSelectHandler = (row: PatternsColumns | null) => {
    if (isDeleting) return;

    if (row === null) {
      setEdit('patterns', 'initialize');
      return;
    }

    setEdit('patterns', row);
    setPanelState('patterns', 'isNew', false);
  };

  return (
    <div className="flex h-full w-full flex-1 gap-5 px-4">
      <div className={'flex flex-7'}>
        <DataTable<PatternsColumns, unknown>
          columns={PATTERNS_COLUMNS}
          data={patterns}
          isEdit={isDeleting}
          enableRowClickSelection={true}
          enableMultiRowSelection={isDeleting}
          onSelectedRow={onSelectHandler}
          tableControls={(table) => {
            const onFilterChange = (value: string) => {
              table.getColumn(filter.value)?.setFilterValue('');
              const find = FILTER.find((r) => r.value === value) ?? FILTER[0];
              setFilter(find);
            };
            return (
              <div className={'flex w-full justify-between'}>
                <div className={'flex gap-1'}>
                  <ButtonGroup>
                    <Select value={filter.value} onValueChange={onFilterChange}>
                      <SelectTrigger className="font-mono" size={'sm'}>
                        {filter.label}
                      </SelectTrigger>
                      <SelectContent className="min-w-18">
                        {FILTER.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            <span className="text-muted-foreground">{f.label}</span>
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

                          remove(
                            'patterns',
                            selected.map((r) => r.id)
                          );
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
      <PatternsSidePanel isDeleting={isDeleting} />
    </div>
  );
}
