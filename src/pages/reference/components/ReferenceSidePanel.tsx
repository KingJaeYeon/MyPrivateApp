import React, { useEffect, useState } from 'react';
import { ReferenceColumns } from '@/components/data-table-columns/reference-columns.tsx';
import { format } from 'date-fns';
import useReferenceStore from '@/store/useReferenceStore.ts';
import { Textarea } from '@/components/ui/textarea.tsx';
import { FloatingOutlinedInput } from '@/components/FloatingOutlinedInput.tsx';
import { Label } from '@/components/ui/label.tsx';
import { TagChooser } from '@/components/TagChooser.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Badge } from '@/components/ui/badge.tsx';

const init: ReferenceColumns = {
  idx: '',
  updatedAt: format(new Date().toISOString(), 'yyyy.MM.dd'),
  name: '',
  link: '',
  tag: '',
  memo: '',
};

export function ReferenceSidePanel({
  select,
  isDeleting,
  setSelect,
}: {
  select: ReferenceColumns | null;
  setSelect: React.Dispatch<React.SetStateAction<ReferenceColumns | null>>;
  isDeleting: boolean;
}) {
  const { data, update, push } = useReferenceStore();
  const [input, setInput] = useState<ReferenceColumns>(init);

  useEffect(() => {
    function setState() {
      if (isDeleting) {
        setInput(init);
        setSelect(null);
        return;
      }
      if (select) {
        setInput(select);
      } else {
        const idx = !!data[data?.length - 1] ? +data[data.length - 1]?.idx + 1 : 1;
        setInput({ ...init, idx: idx.toString() });
      }
    }
    setState();
  }, [select, isDeleting]);

  const pushInput = () => {
    if (confirm('추가하시겠습니까?\n(엑셀 갱신버튼은 따로 눌러야합니다.)')) {
      const result = push(input);
      if (!result) {
        return;
      }

      const idx = !!data[data?.length - 1] ? +data[data.length - 1]?.idx + 2 : 1;
      setInput({ ...init, idx: idx.toString() });
    }
  };

  const updated = () => {
    update(input);
  };
  return (
    <div className={'mt-2 flex flex-1/6 flex-col'}>
      <div className={'pb-2'}>
        <Badge>{`Idx:${isDeleting ? '0' : input.idx}`}</Badge>
      </div>
      <div className={'flex flex-col gap-3'}>
        <FloatingOutlinedInput
          id={'name'}
          label={'참조명'}
          value={input.name}
          disabled={isDeleting}
          onChangeValue={(value: string) => setInput((prev) => ({ ...prev, name: value }))}
        />
        <FloatingOutlinedInput
          id={'link'}
          label={'링크'}
          value={input.link}
          disabled={isDeleting}
          onChangeValue={(value: string) => setInput((prev) => ({ ...prev, link: value }))}
        />
        <FloatingOutlinedInput
          id={'updatedAt'}
          label={'갱신날짜'}
          value={input.updatedAt}
          onChangeValue={(value: string) => setInput((prev) => ({ ...prev, updatedAt: value }))}
          disabled={true}
        />
        <div className={'flex flex-col gap-4'}>
          <div className={'flex flex-col gap-1'}>
            <Label htmlFor={'memo'} className={'text-sm'}>
              메모
            </Label>
            <Textarea
              variant={'blockquote'}
              id={'memo'}
              value={input.memo}
              disabled={isDeleting}
              showMaxLength={true}
              maxLength={250}
              className={'h-[200px] resize-none'}
              onChange={(e) => setInput((prev) => ({ ...prev, memo: e.target.value }))}
            />
          </div>
          <div>
            <TagChooser
              variants={'float'}
              disabled={isDeleting}
              select={input.tag}
              setSelect={(tags) => setInput((prev) => ({ ...prev, tag: tags }))}
            />
          </div>
        </div>
        <div className={'flex justify-end'}>
          {select ? (
            <Button disabled={!(!!input.name && !!input.link)} onClick={updated}>
              갱신
            </Button>
          ) : (
            <Button disabled={!(!!input.name && !!input.link)} onClick={pushInput}>
              저장
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
