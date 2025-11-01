import { useEffect, useState } from 'react';
import useTagStore from '@/store/useTagStore.ts';
import { Label } from '@/components/ui/label.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { cn } from '@/lib/utils.ts';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * @param select join(',')로 이어진 문자열
 * @param setSelect tags => join(',')로 이어진 문자열
 * @param variants
 * @param disabled
 * @constructor
 * 배열로 변환시 split(',') 필요
 */
export function TagChooser({
  select,
  setSelect,
  variants = 'input',
  disabled,
}: {
  select: string;
  setSelect: (tags: string) => void;
  variants?: 'input' | 'float';
  disabled?: boolean;
}) {
  if (variants === 'input') {
    return <TypeInput select={select} setSelect={setSelect} disabled={disabled} />;
  }
  return <Floating select={select} setSelect={setSelect} disabled={disabled} />;
}

function TypeInput({
  select,
  setSelect,
  disabled,
}: {
  select: string;
  setSelect: (tags: string) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { jsonData, data: tags } = useTagStore.getState();
  return (
    <div className={'flex flex-col gap-2'}>
      <div className={'flex justify-between gap-2'}>
        <Label>태그</Label>
        <Button
          size={'icon-sm'}
          className={cn('h-5 w-5 cursor-pointer', disabled && 'cursor-not-allowed')}
          variant={'ghost'}
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronDown /> : <ChevronUp />}
        </Button>
      </div>
      <div
        className={cn(
          'dark:bg-input/30 border-input flex min-h-9 flex-wrap items-center gap-x-1 gap-y-1.5 rounded-md border bg-transparent px-3 py-2'
        )}
      >
        {select === '' ? (
          <Badge
            className={cn('cursor-pointer text-xs', disabled && 'cursor-not-allowed')}
            onClick={() => {
              if (disabled) {
                return;
              }
              setIsOpen(!isOpen);
            }}
          >
            선택안함
          </Badge>
        ) : (
          select
            .toString()
            .split(',')
            .map((tag, i) => (
              <Badge
                variant="green"
                key={i}
                className={cn(disabled && 'cursor-not-allowed')}
                onClick={() => {
                  if (disabled) {
                    return;
                  }

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
      {disabled ? null : (
        <div
          data-isopen={isOpen}
          className={cn('mt-1 flex flex-wrap gap-1', isOpen ? 'border-t-2 px-2 pt-3' : 'hidden')}
        >
          {tags.map((tag, i) => {
            const isSelected = select?.split(',').includes(tag.idx.toString());
            return (
              <Badge
                key={i}
                variant={isSelected ? 'green' : 'secondary'}
                className={'cursor-pointer'}
                onClick={() => {
                  const currentTags = select !== '' ? select.split(',') : [];

                  if (currentTags.length >= 5) {
                    toast.error('최대 5개까지 선택가능합니다.');
                    return;
                  }

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
      )}
    </div>
  );
}

interface FloatingInputProps {
  select: string;
  setSelect: (value: string) => void;
  id?: string;
  sizeC?: 'lg' | 'default';
  disabled?: boolean;
}
function Floating(props: FloatingInputProps) {
  const { select, setSelect, id, sizeC = 'default', disabled } = props;
  const [isFocused, setIsFocused] = useState(false);
  const { jsonData, data: tags } = useTagStore.getState();

  const sizes = {
    default: {
      label: 'px-1',
      input: 'flex-wrap min-h-[20px] text-sm px-[10px]',
      container: 'flex-wrap min-h-[48px] text-sm py-3',
    },
    lg: {
      label: 'px-1.5',
      input: 'flex-wrap min-h-[28px] px-[14px]',
      container: 'flex-wrap min-h-[56px] py-4',
    },
  };

  useEffect(() => {
    if (select !== '') {
      setIsFocused(true);
    } else {
      setIsFocused(false);
    }
  }, [select]);

  return (
    <div className={cn('flex flex-col gap-2', disabled && 'cursor-not-allowed')}>
      <div className={cn('relative isolate flex flex-col justify-center', sizes[sizeC].container)}>
        <div className={cn('flex gap-1 px-2', sizes[sizeC].input)}>
          {select === ''
            ? ''
            : select
                .toString()
                .split(',')
                .map((tag, i) => (
                  <Badge
                    variant="green"
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
                ))}
        </div>
        <label
          htmlFor={id}
          className={cn(
            'bg-background absolute top-[30%] left-2',
            isFocused ? 'top-[-8px] left-1 scale-[0.8] text-[#0b57b0]' : '',
            sizes[sizeC].label
          )}
          style={{ transition: 'all .3s cubic-bezier(0.4,0,0.2,1)' }}
        >
          태그
        </label>
        <div className={'border-input absolute z-[-1] flex h-full w-full rounded-[4px] border-2'} />
        <div
          className={
            'absolute z-[-1] flex h-full w-full rounded-[4px] border-[3px] border-[#0b57b0]'
          }
          style={{
            transition: 'opacity .3s cubic-bezier(0.4,0,0.2,1)',
            opacity: isFocused ? '1' : '0',
          }}
        />
      </div>
      {disabled ? null : (
        <div className={'scrollWidth3 flex-1 overflow-auto'}>
          <div className={'mt-1 flex flex-wrap gap-1'}>
            {tags.map((tag, i) => {
              const isSelected = select?.toString().split(',').includes(tag.idx.toString());
              return (
                <Badge
                  key={i}
                  variant={isSelected ? 'green' : 'secondary'}
                  className={'cursor-pointer'}
                  onClick={() => {
                    const currentTags = select !== '' ? select.toString().split(',') : [];

                    if (currentTags.length >= 5) {
                      toast.error('최대 5개까지 선택가능합니다.');
                      return;
                    }

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
      )}
    </div>
  );
}
