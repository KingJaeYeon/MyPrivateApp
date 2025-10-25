import React, { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea.tsx';
import { FloatingOutlinedInput } from '@/components/FloatingOutlinedInput.tsx';
import { Label } from '@/components/ui/label.tsx';
import { TagChooser } from '@/components/TagChooser.tsx';
import { PromptsColumns } from '@/components/data-table-columns/prompts-columns.tsx';
import usePromptsStore from '@/store/usePromptsStore.ts';
import { ButtonRenderer } from '@/pages/prompts/components/ButtonRenderer.tsx';
import { BadgeRenderer } from '@/pages/prompts/components/BadgeRenderer.tsx';

const init: PromptsColumns = {
  parentIdx: 0,
  idx: 0,
  prompt: '',
  tag: '',
  memo: '',
  updatedAt: new Date().toISOString(),
  createdAt: new Date().getTime(),
};

const getNextIdx = (data: PromptsColumns[]) => {
  return data.length > 0 ? Number(data[data.length - 1].idx) + 1 : 1;
};

const createNewInput = (data: PromptsColumns[], parentIdx?: number): PromptsColumns => {
  const idx = getNextIdx(data);
  return {
    ...init,
    idx,
    parentIdx: parentIdx ?? idx,
  };
};

export function PromptSidePanel({
  select,
  isDeleting,
  setSelect,
}: {
  select: PromptsColumns | null;
  setSelect: React.Dispatch<React.SetStateAction<PromptsColumns | null>>;
  isDeleting: boolean;
}) {
  const { data, update, push } = usePromptsStore();
  const [input, setInput] = useState<PromptsColumns>(init);
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
    <div className={'mt-2 flex flex-1/4 flex-col'}>
      <div className={'flex gap-2 pb-2'}>
        <BadgeRenderer isSub={isSub} isDeleting={isDeleting} id={input.idx} pId={input.parentIdx} />
      </div>
      <div className={'flex flex-col gap-3'}>
        <FloatingOutlinedInput
          id={'updatedAt'}
          label={'갱신일'}
          value={input.updatedAt}
          onChangeValue={(value: string) => setInput((prev) => ({ ...prev, updatedAt: value }))}
          disabled={true}
        />
        <div className={'flex flex-col gap-4'}>
          <div className={'flex flex-col gap-1'}>
            <Label htmlFor={'prompt'} className={'text-sm'}>
              프롬프트
            </Label>
            <Textarea
              variant={'blockquote'}
              id={'prompt'}
              value={input.prompt}
              disabled={isDeleting}
              showMaxLength={true}
              maxLength={1000}
              className={'h-[200px] resize-none'}
              onChange={(e) => setInput((prev) => ({ ...prev, prompt: e.target.value }))}
            />
          </div>
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
              className={'h-[20px] resize-none'}
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
            disabled={!input.prompt}
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
