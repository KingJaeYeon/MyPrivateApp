import React, { useEffect, useState } from 'react';
import { ReferenceColumns } from '@/components/data-table-columns/reference-columns.tsx';
import useReferenceStore from '@/store/useReferenceStore.ts';
import { Textarea } from '@/components/ui/textarea.tsx';
import { FloatingOutlinedInput } from '@/components/FloatingOutlinedInput.tsx';
import { Label } from '@/components/ui/label.tsx';
import { TagChooser } from '@/components/TagChooser.tsx';
import { ButtonRenderer } from '@/pages/reference/components/ButtonRenderer.tsx';
import { BadgeRenderer } from '@/pages/reference/components/BadgeRenderer.tsx';

const init: ReferenceColumns = {
  parentIdx: 0,
  idx: 0,
  name: '',
  link: '',
  tag: '',
  memo: '',
  updatedAt: new Date().toISOString(),
  createdAt: new Date().getTime(),
};

const getNextIdx = (data: ReferenceColumns[]) => {
  return data.length > 0 ? Number(data[data.length - 1].idx) + 1 : 1;
};

const createNewInput = (data: ReferenceColumns[], parentIdx?: number): ReferenceColumns => {
  const idx = getNextIdx(data);
  return {
    ...init,
    idx,
    parentIdx: parentIdx ?? idx,
  };
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
  const [isSub, setIsSub] = useState<boolean>(false);

  useEffect(() => {
    if (isDeleting) {
      setInput(init);
      setSelect(null);
      setIsSub(false);
      return;
    }
    // Sub 모드
    if (isSub) {
      setInput(createNewInput(data, Number(select?.idx)));
      return;
    }

    // 선택된 항목 있음
    if (select) {
      setInput(select);
      return;
    }

    // 새 항목
    setInput(createNewInput(data));
    setIsSub(false);
  }, [select, isDeleting, isSub]);

  const pushInput = () => {
    if (!confirm('추가하시겠습니까?\n(엑셀 갱신버튼은 따로 눌러야합니다.)')) {
      return;
    }

    const result = push(input);
    if (!result) return;

    setInput(createNewInput(data));
    setIsSub(false);
  };

  return (
    <div className={'mt-2 flex flex-1/6 flex-col'}>
      <div className={'flex gap-2 pb-2'}>
        <BadgeRenderer isSub={isSub} isDeleting={isDeleting} id={input.idx} pId={input.parentIdx} />
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
        <div className={'flex justify-end gap-2'}>
          <ButtonRenderer
            isSub={isSub}
            disabled={!(!!input.name && !!input.link)}
            pushInput={pushInput}
            setIsSub={setIsSub}
            isDeleting={isDeleting}
            isSelect={!!select}
            updated={() => update(input)}
          />
        </div>
      </div>
    </div>
  );
}
