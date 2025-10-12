import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import useTagStore from '@/store/tag';
import { useState } from 'react';
import { Label } from '@/components/ui/label.tsx';
import ButtonSwitcher from '@/components/ButtonSwitcher.tsx';
import { Alert, AlertTitle } from '@/components/ui/alert.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { toast } from 'sonner';
import { Muted } from '@/components/typography.tsx';
import useChannelStore from '@/store/channels.ts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';

export function TagFilterRow({ mode }: { mode: 'channels' | 'keywords' }) {
  // const { data: filter, set } = useFilterStore((s) => ({ data: s.data, set: s.set }));
  const tags = useTagStore((s) => s.data);
  const [open, setOpen] = useState(false);

  const [tagLogic, setTagLogic] = useState<string>('AND');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // idx → name 매핑
  // const selectedTags = useMemo(
  //   () =>
  //     filter.selectedTagIds.map((id) => tags.find((t) => t.idx === id)).filter(Boolean) as {
  //       idx: number;
  //       name: string;
  //       color?: string;
  //     }[],
  //   [filter.selectedTagIds, tags]
  // );
  //
  // const toggleTag = (idx: number) => {
  //   const cur = new Set(filter.selectedTagIds);
  //   cur.has(idx) ? cur.delete(idx) : cur.add(idx);
  //   set('selectedTagIds', Array.from(cur));
  // };

  return (
    <div
      className={cn(
        'grid overflow-hidden transition-[grid-template-rows] duration-300',
        mode === 'channels' ? 'grid-rows-[1fr] pb-3 border-b' : 'grid-rows-[0fr]'
      )}
    >
      <div className="min-h-0 flex flex-wrap items-center gap-2">
        <div className={'flex gap-4 justify-between'}>
          <Label className={'opacity-80'}>태그 필터</Label>
          <ButtonSwitcher
            state={tagLogic}
            setState={setTagLogic}
            size={'sm'}
            list={[
              { label: 'AND', value: 'AND' },
              { label: 'OR', value: 'OR' },
            ]}
          />
        </div>
        <div className={'flex gap-2 items-center'}>
          <TagSelector selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
          <Alert size={'sm'} className={'w-[300px]'}>
            <AlertTitle>{`채널 ${selectedTags.length}개 검색(${tagLogic})`}</AlertTitle>
          </Alert>
        </div>
      </div>
    </div>
  );
}

function TagSelector({
  selectedTags,
  setSelectedTags,
}: {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
}) {
  const { data: tags, jsonData } = useTagStore();
  const channels = useChannelStore((s) => s.data);
  const [tempTags, setTempTags] = useState<string[]>(selectedTags);
  const [open, setOpen] = useState(false);
  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setTempTags(selectedTags);
        }
      }}
    >
      <SheetTrigger>
        <Button
          size={'sm'}
          variant={'outline'}
          className={'w-[260px] justify-start px-3 cursor-pointer'}
        >
          태그 검색 ( Max:5 )...
        </Button>
      </SheetTrigger>
      <SheetContent side={'left'} className={'min-w-[400px] flex flex-1 flex-col'}>
        <SheetHeader>
          <SheetTitle>태그 필터</SheetTitle>
          <SheetDescription hidden />
        </SheetHeader>
        <div className="flex flex-col flex-1 auto-rows-min gap-6">
          <div className={'flex flex-col gap-3'}>
            <Muted>태그를 선택해주세요:</Muted>
            <div className={'flex flex-wrap gap-1 max-h-[250px] overflow-auto scrollWidth3'}>
              {tags.map((tag) => {
                const selected = tempTags.includes(tag.name);
                return (
                  <Badge
                    key={tag.idx}
                    className={'cursor-pointer'}
                    variant={selected ? 'green' : 'outline'}
                    onClick={() => {
                      let newSelectedTags = [...tempTags];
                      if (selected) {
                        newSelectedTags = newSelectedTags.filter((t) => t !== tag.name);
                      } else {
                        if (newSelectedTags.length < 5) {
                          newSelectedTags.push(tag.name);
                        } else {
                          toast.error('태그는 최대 5개까지 선택할 수 있습니다.');
                        }
                      }
                      setTempTags(newSelectedTags);
                    }}
                  >
                    {tag.name}
                    {selected && ' ✓'}
                  </Badge>
                );
              })}
            </div>
          </div>
          <div className={'flex flex-col gap-3 flex-1'}>
            <Muted>해당되는 채널리스트: 2</Muted>
            <div className={'relative flex flex-1 overflow-auto scrollWidth3 h-full'}>
              <div className={'absolute w-full h-full'}>
                <div className="w-full rounded-md border flex-1 h-full px-4 flex flex-col">
                  {channels.map((channel) => (
                    <div className={'flex w-full border-b justify-between items-center py-2'}>
                      <span
                        className="tabular-nums text-xs py-2 flex flex-1 gap-1 items-center"
                        key={channel.channelId}
                      >
                        <Avatar className={'w-6 h-6'}>
                          <AvatarImage src={channel.icon} />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <p className={'font-bold'}>{channel.name}</p>
                      </span>
                      <div className={'max-w-[180px] text-end'}>
                        {channel.tag.split(',').map((tag, i) => (
                          <Badge variant="secondary" key={i} size={'sm'}>
                            {jsonData[tag]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <SheetFooter>
          <Button
            onClick={() => {
              setSelectedTags(tempTags);
              toast.success(`태그 필터가 적용되었습니다.`);
            }}
          >
            Save
          </Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
