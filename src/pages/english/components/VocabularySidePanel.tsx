import { useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea.tsx';
import { FloatingOutlinedInput } from '@/components/FloatingOutlinedInput.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Button } from '@/components/ui/button.tsx';
import useEnglishStore from '@/store/useEnglishStore.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { Input } from '@/components/ui/input.tsx';

export function VocabularySidePanel({ isDeleting }: { isDeleting: boolean }) {
  const { verbsEdit, verbsPanelState, setEdit, update, push } = useEnglishStore();
  const edit = verbsEdit;

  useEffect(() => {
    setEdit('verbs', 'initialize');
  }, []);

  const pushInput = () => {
    if (!confirm('추가하시겠습니까?\n(엑셀 갱신버튼은 따로 눌러야합니다.)')) return;
    push('verbs', edit);
  };

  const updateVerb = () => {
    update('verbs', []);
  };

  const handleArrayChange = (field: 'patternIds' | 'conceptIds', value: string) => {
    const current = Array.isArray(edit[field]) ? edit[field] : [];
    const values = value.split(',').map((v) => v.trim()).filter(Boolean);
    setEdit('verbs', { ...edit, [field]: values });
  };

  const handleArrayRemove = (field: 'patternIds' | 'conceptIds', index: number) => {
    const current = Array.isArray(edit[field]) ? edit[field] : [];
    const newArray = current.filter((_, i) => i !== index);
    setEdit('verbs', { ...edit, [field]: newArray });
  };

  return (
    <div className={'mt-2 flex h-full flex-1/4 flex-col gap-3'}>
      <div className={'flex gap-2 pb-2'}>
        <Badge variant={verbsPanelState.isNew ? 'secondary' : 'green'}>
          {verbsPanelState.isNew ? '새 항목' : '편집 중'}
        </Badge>
        {edit.id && <Badge variant="outline">ID: {edit.id.slice(0, 8)}...</Badge>}
      </div>

      <div className={'flex flex-col gap-3'}>
        <FloatingOutlinedInput
          id={'word'}
          label={'동사'}
          value={edit.word || ''}
          disabled={isDeleting}
          onChangeValue={(value: string) => setEdit('verbs', { ...edit, word: value })}
        />

        <FloatingOutlinedInput
          id={'meaning'}
          label={'의미'}
          value={edit.meaning || ''}
          disabled={isDeleting}
          onChangeValue={(value: string) => setEdit('verbs', { ...edit, meaning: value })}
        />

        <div className={'flex flex-col gap-1'}>
          <Label htmlFor={'memo'} className={'text-sm'}>
            메모
          </Label>
          <Textarea
            variant={'blockquote'}
            id={'memo'}
            value={edit.memo || ''}
            disabled={isDeleting}
            className={'h-[100px] resize-none'}
            onChange={(e) => setEdit('verbs', { ...edit, memo: e.target.value })}
          />
        </div>

        <div className={'flex flex-col gap-2'}>
          <Label className={'text-sm'}>연결된 패턴 ID (쉼표로 구분)</Label>
          <Input
            placeholder="예: pattern-1, pattern-2"
            value={Array.isArray(edit.patternIds) ? edit.patternIds.join(', ') : ''}
            disabled={isDeleting}
            onChange={(e) => handleArrayChange('patternIds', e.target.value)}
          />
          {Array.isArray(edit.patternIds) && edit.patternIds.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {edit.patternIds.map((patternId, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => !isDeleting && handleArrayRemove('patternIds', idx)}
                >
                  {patternId} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className={'flex flex-col gap-2'}>
          <Label className={'text-sm'}>연결된 개념 ID (쉼표로 구분)</Label>
          <Input
            placeholder="예: concept-1, concept-2"
            value={Array.isArray(edit.conceptIds) ? edit.conceptIds.join(', ') : ''}
            disabled={isDeleting}
            onChange={(e) => handleArrayChange('conceptIds', e.target.value)}
          />
          {Array.isArray(edit.conceptIds) && edit.conceptIds.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {edit.conceptIds.map((conceptId, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => !isDeleting && handleArrayRemove('conceptIds', idx)}
                >
                  {conceptId} ×
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={'flex justify-end gap-2'}>
        {isDeleting ? null : verbsPanelState.isNew ? (
          <Button disabled={!edit.word} onClick={pushInput}>
            저장
          </Button>
        ) : (
          <Button disabled={!edit.word} onClick={updateVerb}>
            갱신
          </Button>
        )}
      </div>
    </div>
  );
}
