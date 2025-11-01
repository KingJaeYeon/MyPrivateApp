import React, { useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea.tsx';
import { FloatingOutlinedInput } from '@/components/FloatingOutlinedInput.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Button } from '@/components/ui/button.tsx';
import useEnglishStore from '@/store/useEnglishStore.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';

export function ConversationsSidePanel({ isDeleting }: { isDeleting: boolean }) {
  const { expressionsEdit, expressionsPanelState, setEdit, update, push } = useEnglishStore();
  const edit = expressionsEdit;

  useEffect(() => {
    setEdit('expressions', 'initialize');
  }, []);

  const pushInput = () => {
    if (!confirm('추가하시겠습니까?\n(엑셀 갱신버튼은 따로 눌러야합니다.)')) return;
    push('expressions', edit);
  };

  const updateExpression = () => {
    update('expressions', []);
  };

  const handleArrayChange = (
    field: 'linkedPatterns' | 'linkedVerbs' | 'linkedConcepts',
    value: string
  ) => {
    const current = Array.isArray(edit[field]) ? edit[field] : [];
    const values = value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    setEdit('expressions', { ...edit, [field]: values });
  };

  const handleArrayRemove = (
    field: 'linkedPatterns' | 'linkedVerbs' | 'linkedConcepts',
    index: number
  ) => {
    const current = Array.isArray(edit[field]) ? edit[field] : [];
    const newArray = current.filter((_, i) => i !== index);
    setEdit('expressions', { ...edit, [field]: newArray });
  };

  return (
    <div className={'mt-2 flex h-full flex-1/4 flex-col gap-3'}>
      <div className={'flex gap-2 pb-2'}>
        <Badge variant={expressionsPanelState.isNew ? 'secondary' : 'green'}>
          {expressionsPanelState.isNew ? '새 항목' : '편집 중'}
        </Badge>
        {edit.id && <Badge variant="outline">ID: {edit.id.slice(0, 8)}...</Badge>}
      </div>

      <div className={'flex flex-col gap-3'}>
        <FloatingOutlinedInput
          id={'text'}
          label={'예문'}
          value={edit.text || ''}
          disabled={isDeleting}
          onChangeValue={(value: string) => setEdit('expressions', { ...edit, text: value })}
        />

        <FloatingOutlinedInput
          id={'meaning'}
          label={'의미'}
          value={edit.meaning || ''}
          disabled={isDeleting}
          onChangeValue={(value: string) => setEdit('expressions', { ...edit, meaning: value })}
        />

        <div className={'flex justify-between gap-1'}>
          <Label htmlFor={'importance'} className={'text-sm'}>
            중요도
          </Label>
          <Select
            value={edit.importance || 'medium'}
            onValueChange={(value) => setEdit('expressions', { ...edit, importance: value })}
            disabled={isDeleting}
          >
            <SelectTrigger>
              <span>{edit.importance || '중요도 선택'}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
            onChange={(e) => setEdit('expressions', { ...edit, memo: e.target.value })}
          />
        </div>

        <div className={'flex flex-col gap-2'}>
          <Label className={'text-sm'}>연결된 패턴 ID (쉼표로 구분)</Label>
          <Input
            placeholder="예: pattern-1, pattern-2"
            value={Array.isArray(edit.linkedPatterns) ? edit.linkedPatterns.join(', ') : ''}
            disabled={isDeleting}
            onChange={(e) => handleArrayChange('linkedPatterns', e.target.value)}
          />
          {Array.isArray(edit.linkedPatterns) && edit.linkedPatterns.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {edit.linkedPatterns.map((patternId, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => !isDeleting && handleArrayRemove('linkedPatterns', idx)}
                >
                  {patternId} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className={'flex flex-col gap-2'}>
          <Label className={'text-sm'}>연결된 동사 ID (쉼표로 구분)</Label>
          <Input
            placeholder="예: verb-1, verb-2"
            value={Array.isArray(edit.linkedVerbs) ? edit.linkedVerbs.join(', ') : ''}
            disabled={isDeleting}
            onChange={(e) => handleArrayChange('linkedVerbs', e.target.value)}
          />
          {Array.isArray(edit.linkedVerbs) && edit.linkedVerbs.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {edit.linkedVerbs.map((verbId, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => !isDeleting && handleArrayRemove('linkedVerbs', idx)}
                >
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
            value={Array.isArray(edit.linkedConcepts) ? edit.linkedConcepts.join(', ') : ''}
            disabled={isDeleting}
            onChange={(e) => handleArrayChange('linkedConcepts', e.target.value)}
          />
          {Array.isArray(edit.linkedConcepts) && edit.linkedConcepts.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {edit.linkedConcepts.map((conceptId, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => !isDeleting && handleArrayRemove('linkedConcepts', idx)}
                >
                  {conceptId} ×
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={'flex justify-end gap-2'}>
        {isDeleting ? null : expressionsPanelState.isNew ? (
          <Button disabled={!edit.text} onClick={pushInput}>
            저장
          </Button>
        ) : (
          <Button disabled={!edit.text} onClick={updateExpression}>
            갱신
          </Button>
        )}
      </div>
    </div>
  );
}
