import { useEffect } from 'react';

import useReferenceStore from '@/store/useReferenceStore.ts';
import { Textarea } from '@/components/ui/textarea.tsx';
import { FloatingOutlinedInput } from '@/components/FloatingOutlinedInput.tsx';
import { Label } from '@/components/ui/label.tsx';
import { TagChooser } from '@/components/TagChooser.tsx';
import { ButtonRenderer } from '@/pages/lib/reference/components/ButtonRenderer.tsx';
import { BadgeRenderer } from '@/pages/lib/reference/components/BadgeRenderer.tsx';

export function ReferenceSidePanel({ isDeleting }: { isDeleting: boolean }) {
  const { update, push, edit, setEdit, panelState } = useReferenceStore();

  useEffect(() => {
    setEdit('initialize');
  }, []);

  const pushInput = () => {
    if (!confirm('추가하시겠습니까?\n(엑셀 갱신버튼은 따로 눌러야합니다.)')) return;
    push(edit);
  };

  return (
    <div className={'mt-2 flex flex-1/6 flex-col'}>
      <div className={'flex gap-2 pb-2'}>
        <BadgeRenderer
          isSub={panelState.isSub}
          isDeleting={isDeleting}
          id={edit.idx}
          isKids={edit?.path?.split('/').length >= 2}
        />
      </div>
      <div className={'flex flex-col gap-3'}>
        <FloatingOutlinedInput
          id={'name'}
          label={'참조명'}
          value={edit.name}
          disabled={isDeleting}
          onChangeValue={(value: string) => setEdit({ ...edit, name: value })}
        />
        <FloatingOutlinedInput
          id={'link'}
          label={'링크'}
          value={edit.link}
          disabled={isDeleting}
          onChangeValue={(value: string) => setEdit({ ...edit, link: value.trim() })}
        />
        <div className={'flex flex-col gap-4'}>
          <div className={'flex flex-col gap-1'}>
            <Label htmlFor={'memo'} className={'text-sm'}>
              메모
            </Label>
            <Textarea
              variant={'blockquote'}
              id={'memo'}
              value={edit.memo}
              disabled={isDeleting}
              showMaxLength={true}
              maxLength={1000}
              className={'h-[200px] resize-none'}
              onChange={(e) => setEdit({ ...edit, memo: e.target.value })}
            />
          </div>
          <div>
            <TagChooser
              variants={'float'}
              disabled={isDeleting}
              select={edit.tag}
              setSelect={(tags) => setEdit({ ...edit, tag: tags })}
            />
          </div>
        </div>
        <div className={'flex justify-end gap-2'}>
          <ButtonRenderer
            disabled={!edit.name}
            pushInput={pushInput}
            isDeleting={isDeleting}
            updated={() => update(edit)}
          />
        </div>
      </div>
    </div>
  );
}
