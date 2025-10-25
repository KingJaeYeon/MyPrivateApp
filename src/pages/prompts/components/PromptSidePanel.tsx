import { useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea.tsx';
import { FloatingOutlinedInput } from '@/components/FloatingOutlinedInput.tsx';
import { Label } from '@/components/ui/label.tsx';
import { TagChooser } from '@/components/TagChooser.tsx';
import usePromptsStore from '@/store/usePromptsStore.ts';
import { ButtonRenderer } from '@/pages/prompts/components/ButtonRenderer.tsx';
import { BadgeRenderer } from '@/pages/prompts/components/BadgeRenderer.tsx';
import { Button } from '@/components/ui/button.tsx';
import { IconCheck, IconLinearCopy } from '@/assets/svg';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard.ts';
import { toast } from 'sonner';

export function PromptSidePanel({ isDeleting }: { isDeleting: boolean }) {
  const { update, push, edit, setEdit, panelState } = usePromptsStore();
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  useEffect(() => {
    setEdit('initialize');
  }, []);

  const pushInput = () => {
    if (!confirm('추가하시겠습니까?\n(엑셀 갱신버튼은 따로 눌러야합니다.)')) return;
    push(edit);
  };

  return (
    <div className={'mt-2 flex flex-1/4 flex-col'}>
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
          id={'title'}
          label={'제목'}
          value={edit.title}
          disabled={isDeleting}
          onChangeValue={(value: string) => setEdit({ ...edit, title: value })}
        />
        <div className={'flex flex-col gap-4'}>
          <div className={'flex flex-col gap-1'}>
            <Label htmlFor={'prompt'} className={'text-sm'}>
              프리뷰
              {!panelState.isNew && (
                <Button
                  size={'xs'}
                  variant={'secondary'}
                  onClick={() => {
                    copyToClipboard(edit.prompt);
                    toast.success('복사되었습니다.');
                  }}
                >
                  {isCopied ? <IconCheck /> : <IconLinearCopy />}
                </Button>
              )}
            </Label>
            <Textarea
              variant={'blockquote'}
              id={'prompt'}
              value={edit.prompt}
              disabled={isDeleting}
              showMaxLength={true}
              maxLength={1000}
              className={'h-[200px] resize-none'}
              onChange={(e) => setEdit({ ...edit, prompt: e.target.value })}
            />
          </div>
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
              maxLength={250}
              className={'h-[20px] resize-none'}
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
            disabled={!(!!edit.prompt && !!edit.title)}
            pushInput={pushInput}
            isDeleting={isDeleting}
            updated={() => update(edit)}
          />
        </div>
      </div>
    </div>
  );
}
