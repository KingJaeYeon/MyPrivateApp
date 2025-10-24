import React, { useEffect, useState } from 'react';
import { ReferenceColumns } from '@/components/data-table-columns/reference-columns.tsx';
import useReferenceStore from '@/store/useReferenceStore.ts';
import { Textarea } from '@/components/ui/textarea.tsx';
import { FloatingOutlinedInput } from '@/components/FloatingOutlinedInput.tsx';
import { Label } from '@/components/ui/label.tsx';
import { TagChooser } from '@/components/TagChooser.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Badge } from '@/components/ui/badge.tsx';

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
    function setState() {
      if (isDeleting) {
        setInput(init);
        setSelect(null);
        setIsSub(false);
        return;
      }
      if (select) {
        setInput(select);
      } else {
        const idx = !!data[data?.length - 1] ? +data[data.length - 1]?.idx + 1 : 1;
        setInput({ ...init, idx, parentIdx: idx });
      }
      setIsSub(false);
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
      setInput({ ...init, idx });
      setIsSub(false);
    }
  };

  const updated = () => {
    update(input);
  };

  useEffect(() => {
    const onStartSubAdd = () => {
      if (isSub) {
        const idx = Number(data[data.length - 1]?.idx) + 1;
        setInput({
          ...init,
          idx: idx,
          parentIdx: Number(select?.idx!),
        });
        return;
      }
      if (select) {
        setInput(select);
      } else {
        const idx = !!data[data?.length - 1] ? +data[data.length - 1]?.idx + 1 : 1;
        setInput({ ...init, idx, parentIdx: idx });
      }
    };

    onStartSubAdd();
  }, [isSub]);

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
            updated={updated}
          />
        </div>
      </div>
    </div>
  );
}

function BadgeRenderer({
  isDeleting,
  isSub,
  pId,
  id,
}: {
  isDeleting: boolean;
  isSub: boolean;
  pId: number;
  id: number;
}) {
  if (isDeleting) {
    return <Badge>{`Idx:0`}</Badge>;
  }

  if (isSub || pId !== id) {
    return (
      <>
        <Badge>{`pIdx:${pId}`}</Badge>
        <Badge>{`Idx:${id}`}</Badge>
      </>
    );
  }

  return <Badge>{`Idx:${id}`}</Badge>;
}

function ButtonRenderer({
  isDeleting,
  isSelect,
  isSub,
  disabled,
  setIsSub,
  pushInput,
  updated,
}: {
  isDeleting: boolean;
  isSelect: boolean;
  isSub: boolean;
  disabled: boolean;
  setIsSub: (b: boolean) => void;
  pushInput: () => void;
  updated: () => void;
}) {
  if (isDeleting) {
    return null;
  }

  if (!isSelect) {
    return (
      <Button disabled={disabled} onClick={pushInput}>
        저장
      </Button>
    );
  }

  if (isSelect && isSub) {
    return (
      <>
        <Button variant={'secondary'} onClick={() => setIsSub(false)}>
          취소
        </Button>
        <Button disabled={disabled} onClick={pushInput}>
          저장
        </Button>
      </>
    );
  }

  if (isSelect && !isSub) {
    return (
      <>
        <Button variant={'secondary'} onClick={() => setIsSub(true)}>
          하위 항목 추가
        </Button>
        <Button disabled={disabled} onClick={updated}>
          갱신
        </Button>
      </>
    );
  }
}
