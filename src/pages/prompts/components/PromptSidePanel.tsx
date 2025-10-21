import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea.tsx';
import { FloatingOutlinedInput } from '@/components/FloatingOutlinedInput.tsx';
import { Label } from '@/components/ui/label.tsx';
import { TagChooser } from '@/components/TagChooser.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { PromptsColumns } from '@/components/data-table-columns/prompts-columns.tsx';
import usePromptsStore from '@/store/usePromptsStore.ts';

const init: PromptsColumns = {
  idx: '',
  updatedAt: format(new Date().toISOString(), 'yyyy.MM.dd'),
  prompt: '',
  tag: '',
  memo: '',
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
        const idx = !!data[data?.length - 1] ? data[data.length - 1]?.idx + 1 : 1;
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

      setInput(init);
    }
  };

  const updated = () => {
    update(input);
  };
  return (
    <div className={'mt-2 flex flex-1/4 flex-col'}>
      <div className={'pb-2'}>
        <Badge>{`Idx:${isDeleting ? '0' : input.idx}`}</Badge>
      </div>
      <div className={'flex flex-col gap-3'}>
        <FloatingOutlinedInput
          id={'updatedAt'}
          label={'갱신날짜'}
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
        <div className={'flex justify-end'}>
          {select ? (
            <Button disabled={!input.prompt} onClick={updated}>
              갱신
            </Button>
          ) : (
            <Button disabled={!input.prompt} onClick={pushInput}>
              저장
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
