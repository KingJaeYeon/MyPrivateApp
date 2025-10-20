import { useState } from 'react';
import useTagStore from '@/store/useTagStore.ts';
import { Label } from '@/components/ui/label.tsx';
import { Button } from '@/components/ui/button.tsx';
import { IconArrowDown, IconArrowUp } from '@/assets/svg';
import { Badge } from '@/components/ui/badge.tsx';
import { cn } from '@/lib/utils.ts';

/**
 * @param select join(',')로 이어진 문자열
 * @param setSelect tags => join(',')로 이어진 문자열
 * @constructor
 * 배열로 변환시 split(',') 필요
 */
export function TagChooser({
  select,
  setSelect,
}: {
  select: string;
  setSelect: (tags: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { jsonData, data: tags } = useTagStore.getState();

  return (
    <div className={'flex flex-col gap-2'}>
      <div className={'flex justify-between gap-2'}>
        <Label>태그</Label>
        <Button
          size={'icon-sm'}
          className={'h-5 w-5 cursor-pointer'}
          variant={'ghost'}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <IconArrowDown /> : <IconArrowUp />}
        </Button>
      </div>
      <div className={'flex flex-wrap gap-0.5'}>
        {select === '' ? (
          <Label className={'cursor-pointer text-xs'} onClick={() => setIsOpen(!isOpen)}>
            선택안함
          </Label>
        ) : (
          select.split(',').map((tag, i) => (
            <Badge
              variant="secondary"
              key={i}
              onClick={() => {
                const currentTags = select !== '' ? select.split(',') : [];
                if (currentTags.includes(tag)) {
                  // 이미 있으면 제거
                  const newTags = currentTags.filter((t) => t !== tag);
                  setSelect(newTags.join(','));
                }
              }}
            >
              {jsonData[tag]}
            </Badge>
          ))
        )}
      </div>
      <div
        data-isopen={isOpen}
        className={cn('mt-1 flex flex-wrap gap-1', isOpen ? 'border-t-2 pt-3' : 'hidden')}
      >
        {tags.map((tag, i) => {
          const isSelected = select?.split(',').includes(tag.idx.toString());
          return (
            <Badge
              key={i}
              variant={isSelected ? 'secondary' : 'outline'}
              className={'cursor-pointer'}
              onClick={() => {
                const currentTags = select !== '' ? select.split(',') : [];
                if (currentTags.includes(tag.idx.toString())) {
                  // 이미 있으면 제거
                  const newTags = currentTags.filter((t) => t !== tag.idx.toString());
                  setSelect(newTags.join(','));
                } else {
                  // 없으면 추가
                  currentTags.push(tag.idx.toString());
                  setSelect(currentTags.join(','));
                }
              }}
            >
              {tag.name}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
