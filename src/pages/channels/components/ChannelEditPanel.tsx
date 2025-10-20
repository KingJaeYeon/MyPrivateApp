import { ChannelColumns } from '@/components/data-table-columns/channel-columns.tsx';
import { useState } from 'react';
import useTagStore from '@/store/useTagStore.ts';
import useChannelStore from '@/store/useChannelStore.ts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Input } from '@/components/ui/input.tsx';
import { IconArrowDown, IconArrowUp } from '@/assets/svg';
import { Badge } from '@/components/ui/badge.tsx';
import { cn } from '@/lib/utils.ts';
import { Textarea } from '@/components/ui/textarea.tsx';

export function ChannelEditPanel({
  select,
  setSelect,
}: {
  select: ChannelColumns | null;
  setSelect: React.Dispatch<React.SetStateAction<ChannelColumns | null>>;
}) {
  if (!select) return null;
  const nf = new Intl.NumberFormat();
  const { jsonData, data: tags } = useTagStore.getState();
  const { data, update } = useChannelStore();
  const [isOpen, setIsOpen] = useState(false);
  const onCancel = () => setSelect(null);

  const onChangeHandler = (key: keyof ChannelColumns, value: string) => {
    if (!select) return;
    setSelect({ ...select, [key]: key === 'platform' ? value.toLowerCase() : value });
  };

  const onUpdateRow = () => {
    if (!select) return;
    const copy = data.map((item) => (item.channelId === select.channelId ? select : item));
    update(copy);
    setSelect(null);
  };

  const onDeleteRow = () => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }
    if (!select) return;
    const arr = data.filter((item) => item.channelId !== select.channelId);
    update(arr);
    setSelect(null);
  };

  return (
    <div className="bg-background flex w-[400px] flex-col rounded-sm border p-6 shadow-xl">
      <div className={'flex flex-1 flex-col gap-3'}>
        <div className={'flex justify-between'}>
          <span className="flex items-center gap-1 text-xs tabular-nums">
            <Avatar className={'h-6 w-6'}>
              <AvatarImage src={select.icon} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <p className={'font-bold'}>{`${select.name} (${select.handle})`}</p>
          </span>
          <div>
            <Button variant={'destructive'} size={'sm'} onClick={onDeleteRow}>
              삭제
            </Button>
          </div>
        </div>
        <div className={'grid grid-cols-2 gap-y-1'}>
          <div className={'flex'}>
            <Label>국가:</Label>
            <p className={'cursor-pointer pl-2 text-sm font-bold break-words whitespace-normal'}>
              {select.regionCode}
            </p>
          </div>
          <div className={'flex'}>
            <Label>조회수:</Label>
            <span className="pl-2 text-sm font-bold tabular-nums">
              {nf.format(select.viewCount)}
            </span>
          </div>
          <div className={'flex'}>
            <Label>구독자 수:</Label>
            <span className="pl-2 text-sm font-bold tabular-nums">
              {nf.format(select.subscriberCount)}
            </span>
          </div>
          <div className={'flex'}>
            <Label>생성일:</Label>
            <span className="pl-2 text-sm font-bold tabular-nums">{select.publishedAt}</span>
          </div>
        </div>
        <div className={'flex'}>
          <Label>채널ID(고유값):</Label>
          <p className={'pl-2 text-sm font-bold break-words whitespace-normal'}>
            {select.channelId}
          </p>
        </div>
        <div className={'scrollWidth3 relative flex flex-1 overflow-auto border-t pt-4'}>
          <div className={'absolute flex w-full flex-col gap-4'}>
            <div className={'flex flex-col gap-2'}>
              <Label>링크:</Label>
              <Input
                className={'w-full'}
                value={select?.link}
                onChange={(e) => onChangeHandler('link', e.target.value)}
              />
            </div>
            <div className={'flex flex-col gap-2'}>
              <Label>플랫폼:</Label>
              <Input
                className={'w-full'}
                value={select?.platform}
                onChange={(e) => onChangeHandler('platform', e.target.value)}
              />
            </div>
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
                {select.tag === '' ? (
                  <Label className={'cursor-pointer text-xs'} onClick={() => setIsOpen(!isOpen)}>
                    선택안함
                  </Label>
                ) : (
                  select.tag.split(',').map((tag, i) => (
                    <Badge
                      variant="secondary"
                      key={i}
                      onClick={() => {
                        const currentTags = select?.tag ? select.tag.split(',') : [];
                        if (currentTags.includes(tag)) {
                          // 이미 있으면 제거
                          const newTags = currentTags.filter((t) => t !== tag);
                          onChangeHandler('tag', newTags.join(','));
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
                className={cn('mt-2 flex flex-wrap gap-1', isOpen ? '' : 'hidden')}
              >
                {tags.map((tag, i) => {
                  const isSelected = select?.tag.split(',').includes(tag.idx.toString());
                  return (
                    <Badge
                      key={i}
                      variant={isSelected ? 'secondary' : 'outline'}
                      className={'cursor-pointer'}
                      onClick={() => {
                        const currentTags = select?.tag ? select.tag.split(',') : [];
                        if (currentTags.includes(tag.idx.toString())) {
                          // 이미 있으면 제거
                          const newTags = currentTags.filter((t) => t !== tag.idx.toString());
                          onChangeHandler('tag', newTags.join(','));
                        } else {
                          // 없으면 추가
                          currentTags.push(tag.idx.toString());
                          onChangeHandler('tag', currentTags.join(','));
                        }
                      }}
                    >
                      {tag.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
            <div className={'flex flex-col gap-2'}>
              <Label>메모</Label>
              <Textarea
                className={'h-[100px] w-full resize-none'}
                value={select?.memo}
                onChange={(e) => onChangeHandler('memo', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant={'outline'} onClick={onCancel}>
          취소
        </Button>
        <Button onClick={onUpdateRow}>저장</Button>
      </div>
    </div>
  );
}
