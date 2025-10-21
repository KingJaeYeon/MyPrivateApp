import useTagStore from '@/store/useTagStore.ts';
import { useState } from 'react';
import { ReferenceColumns } from '@/components/data-table-columns/reference-columns.tsx';
import { format } from 'date-fns';
import useReferenceStore from '@/store/useReferenceStore.ts';
import { Textarea } from '@/components/ui/textarea.tsx';
import { FloatingOutlinedInput } from '@/components/FloatingOutlinedInput.tsx';
import { Label } from '@/components/ui/label.tsx';
import { TagChooser } from '@/components/TagChooser.tsx';
import { Button } from '@/components/ui/button.tsx';

const init: ReferenceColumns = {
  updatedAt: format(new Date().toISOString(), 'yyyy.MM.dd'),
  name: '',
  link: '',
  tag: '',
  memo: '',
};

export function AddReference() {
  const { update } = useReferenceStore();
  const { jsonData, data: tags } = useTagStore.getState();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState<ReferenceColumns>(init);
  // const pushInput = () => {
  //   if (confirm('추가하시겠습니까?\n(엑셀 갱신버튼은 따로 눌러야합니다.)')) {
  //     const result = push(inputs);
  //     if (!result) {
  //       return;
  //     }
  //
  //     setInputs(init);
  //   }
  // };
  //
  // const addInput = () => {
  //   setInputs([
  //     ...inputs,
  //     {
  //       idx: '',
  //       name: '',
  //       usedChannels: 0,
  //       usedVideos: 0,
  //       usedEnglish: 0,
  //       usedPrompt: 0,
  //       usedReference: 0,
  //       total: 0,
  //     },
  //   ]);
  // };
  //
  // const removeInput = (index: number) => {
  //   if (confirm('입력칸을 삭제하시겠습니까?\n(입력정보도 삭제됩니다.)')) {
  //     setInputs(inputs.filter((_, i) => i !== index));
  //   }
  // };
  //
  // const setValues = (index: number, key: string, value: string) => {
  //   setInputs(
  //     inputs.map((input, i) => {
  //       if (i === index) {
  //         return { ...input, [key]: value };
  //       }
  //       return input;
  //     })
  //   );
  // };
  //
  // const isEmpty = inputs.every((e) => e.name !== '' && e.idx !== '');

  return (
    <div className={'mt-10 flex flex-1/6 flex-col'}>
      <div className={'flex flex-col gap-3'}>
        <FloatingOutlinedInput
          id={'name'}
          label={'참조명'}
          value={input.name}
          onChangeValue={(value: string) => setInput((prev) => ({ ...prev, name: value }))}
        />
        <FloatingOutlinedInput
          id={'link'}
          label={'링크'}
          value={input.link}
          onChangeValue={(value: string) => setInput((prev) => ({ ...prev, link: value }))}
        />
        {/*<FloatingOutlinedInput*/}
        {/*  id={'updatedAt'}*/}
        {/*  label={'갱신날짜'}*/}
        {/*  value={input.tag}*/}
        {/*  onChangeValue={(value: string) => setInput((prev) => ({ ...prev, tag: value }))}*/}
        {/*/>*/}
        <div className={'flex flex-col gap-4'}>
          <div className={'flex flex-col gap-1'}>
            <Label htmlFor={'memo'} className={'text-sm'}>
              메모
            </Label>
            <Textarea
              variant={'blockquote'}
              id={'memo'}
              value={input.memo}
              hasMaxLength={true}
              showMaxLength={true}
              maxLength={250}
              className={'h-[200px] resize-none'}
              onChange={(e) => setInput((prev) => ({ ...prev, memo: e.target.value }))}
            />
          </div>
          <div>
            <TagChooser
              variants={'float'}
              select={input.tag}
              setSelect={(tags) => setInput((prev) => ({ ...prev, tag: tags }))}
            />
          </div>
        </div>
        <div className={'flex justify-end'}>
          <Button>저장</Button>
        </div>
      </div>
    </div>
  );
}
