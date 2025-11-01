import { useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea.tsx';
import { FloatingOutlinedInput } from '@/components/FloatingOutlinedInput.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Button } from '@/components/ui/button.tsx';
import useEnglishStore from '@/store/useEnglishStore.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { Input } from '@/components/ui/input.tsx';
import type { DBSchema } from '../../../electron/docs.schema.ts';

export function PatternsSidePanel({ isDeleting }: { isDeleting: boolean }) {
  const { patternsEdit, patternsPanelState, setEdit, update, push } = useEnglishStore();
  const edit = patternsEdit;

  useEffect(() => {
    setEdit('patterns', 'initialize');
  }, []);

  const pushInput = () => {
    if (!confirm('추가하시겠습니까?\n(엑셀 갱신버튼은 따로 눌러야합니다.)')) return;
    push('patterns', edit);
  };

  const updatePattern = () => {
    update('patterns', []);
  };

  const handleArrayChange = (field: 'examples' | 'verbIds' | 'conceptIds', value: string) => {
    const current = Array.isArray(edit[field]) ? edit[field] : [];
    const values = value.split(',').map((v) => v.trim()).filter(Boolean);
    setEdit('patterns', { ...edit, [field]: values });
  };

  const handleArrayRemove = (field: 'examples' | 'verbIds' | 'conceptIds', index: number) => {
    const current = Array.isArray(edit[field]) ? edit[field] : [];
    const newArray = current.filter((_, i) => i !== index);
    setEdit('patterns', { ...edit, [field]: newArray });
  };

  return (
    <div className={'mt-2 flex h-full flex-1/4 flex-col gap-3'}>
      <div className={'flex gap-2 pb-2'}>
        <Badge variant={patternsPanelState.isNew ? 'secondary' : 'green'}>
          {patternsPanelState.isNew ? '새 항목' : '편집 중'}
        </Badge>
        {edit.id && <Badge variant="outline">ID: {edit.id.slice(0, 8)}...</Badge>}
      </div>

      <div className={'flex flex-col gap-3'}>
        <FloatingOutlinedInput
          id={'title'}
          label={'패턴명'}
          value={edit.title || ''}
          disabled={isDeleting}
          onChangeValue={(value: string) => setEdit('patterns', { ...edit, title: value })}
        />

        <FloatingOutlinedInput
          id={'structure'}
          label={'구조'}
          value={edit.structure || ''}
          disabled={isDeleting}
          onChangeValue={(value: string) => setEdit('patterns', { ...edit, structure: value })}
        />

        <div className={'flex flex-col gap-1'}>
          <Label htmlFor={'description'} className={'text-sm'}>
            설명
          </Label>
          <Textarea
            variant={'blockquote'}
            id={'description'}
            value={edit.description || ''}
            disabled={isDeleting}
            className={'h-[100px] resize-none'}
            onChange={(e) => setEdit('patterns', { ...edit, description: e.target.value })}
          />
        </div>

        <div className={'flex flex-col gap-2'}>
          <Label className={'text-sm'}>예문 (쉼표로 구분)</Label>
          <Input
            placeholder="예: I want to go, I want you to come"
            value={Array.isArray(edit.examples) ? edit.examples.join(', ') : ''}
            disabled={isDeleting}
            onChange={(e) => handleArrayChange('examples', e.target.value)}
          />
          {Array.isArray(edit.examples) && edit.examples.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {edit.examples.map((example, idx) => (
                <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => !isDeleting && handleArrayRemove('examples', idx)}>
                  {example} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className={'flex flex-col gap-2'}>
          <Label className={'text-sm'}>연결된 동사 ID (쉼표로 구분)</Label>
          <Input
            placeholder="예: verb-1, verb-2"
            value={Array.isArray(edit.verbIds) ? edit.verbIds.join(', ') : ''}
            disabled={isDeleting}
            onChange={(e) => handleArrayChange('verbIds', e.target.value)}
          />
          {Array.isArray(edit.verbIds) && edit.verbIds.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {edit.verbIds.map((verbId, idx) => (
                <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => !isDeleting && handleArrayRemove('verbIds', idx)}>
                  {verbId} ×
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
                <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => !isDeleting && handleArrayRemove('conceptIds', idx)}>
                  {conceptId} ×
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={'flex justify-end gap-2'}>
        {isDeleting ? null : patternsPanelState.isNew ? (
          <Button disabled={!edit.title || !edit.structure} onClick={pushInput}>
            저장
          </Button>
        ) : (
          <Button disabled={!edit.title || !edit.structure} onClick={updatePattern}>
            갱신
          </Button>
        )}
      </div>
    </div>
  );
}
