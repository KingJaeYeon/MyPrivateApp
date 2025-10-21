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
import useTagStore from '@/store/useTagStore.ts';
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label.tsx';
import ButtonSwitcher from '@/components/ButtonSwitcher.tsx';
import { Alert, AlertTitle } from '@/components/ui/alert.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { toast } from 'sonner';
import { Muted } from '@/components/typography.tsx';
import useChannelStore from '@/store/useChannelStore.ts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { ChannelColumns } from '@/components/data-table-columns/channel-columns.tsx';
import { useVideoSearchStore } from '@/store/useVideoSearchStore.ts';
import { useChannelPair, useTagsPair } from '@/hooks/useVideoSearchSelectors.tsx';

export function TagFilterRow() {
  const { tagKey, tagLogic } = useTagsPair();
  const { setTags } = useVideoSearchStore();
  const [selectedChannels, setSelectedChannels] = useState<ChannelColumns[]>([]);
  const { channelIds } = useChannelPair();

  const onChangeLogic = (v: string) => {
    setTags('tagLogic', v as 'AND' | 'OR');
  };

  const onChangeTags = (v: string[]) => {
    setTags('tagKey', v);
  };

  return (
    <div
      className={cn(
        'grid overflow-hidden transition-[grid-template-rows] duration-300',
        'grid-rows-[1fr] border-b pb-3'
      )}
    >
      <div className="flex min-h-0 flex-wrap items-center gap-2">
        <div className={'flex justify-between gap-4'}>
          <Label className={'opacity-80'}>태그 필터</Label>
          <ButtonSwitcher
            state={tagLogic}
            setState={onChangeLogic}
            size={'sm'}
            list={[
              { label: 'AND', value: 'AND' },
              { label: 'OR', value: 'OR' },
            ]}
          />
        </div>
        <div className={'flex items-center gap-2'}>
          <TagSelector
            selectedTags={tagKey}
            setSelectedTags={onChangeTags}
            selectedChannels={selectedChannels}
            setSelectedChannels={setSelectedChannels}
            logic={tagLogic}
          />
          <Alert size={'sm'} className={'w-[300px]'}>
            <AlertTitle>{`채널 ${channelIds.length}개 검색(${tagLogic})`}</AlertTitle>
          </Alert>
        </div>
      </div>
    </div>
  );
}

function TagSelector({
  selectedTags,
  setSelectedTags,
  selectedChannels,
  setSelectedChannels,
  logic,
}: {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  selectedChannels: ChannelColumns[];
  setSelectedChannels: (channels: ChannelColumns[]) => void;
  logic: string;
}) {
  const { data: tags, jsonData } = useTagStore();
  const channels = useChannelStore((s) => s.data);
  const [tempTags, setTempTags] = useState<string[]>(selectedTags);
  const [open, setOpen] = useState(false);
  const { setChannel } = useVideoSearchStore();

  useEffect(() => {
    let filteredChannels: ChannelColumns[] = [];
    if (selectedTags.length === 0) {
      filteredChannels = channels;
    } else {
      if (logic === 'OR') {
        filteredChannels = channels.filter((channel) => {
          const channelTags = channel.tag.split(',').map((t) => jsonData[t.trim()]);
          return selectedTags.some((tag) => channelTags.includes(tag));
        });
      } else if (logic === 'AND') {
        filteredChannels = channels.filter((channel) => {
          const channelTags = channel.tag.split(',').map((t) => jsonData[t.trim()]);
          return selectedTags.every((tag) => channelTags.includes(tag));
        });
      }
    }
    setSelectedChannels(filteredChannels);
    setChannel(
      'channelIds',
      filteredChannels.map((c) => c.channelId)
    );
  }, [selectedTags, logic, channels, jsonData, setSelectedChannels]);

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
          className={'min-w-[260px] cursor-pointer justify-start px-2'}
        >
          {selectedTags.length === 0
            ? '태그 검색 ( Max:5 )...'
            : selectedTags.map((tag) => (
                <Badge key={tag} variant="green">
                  {tag}
                </Badge>
              ))}
        </Button>
      </SheetTrigger>
      <SheetContent side={'left'} className={'flex min-w-[400px] flex-1 flex-col'}>
        <SheetHeader>
          <SheetTitle>태그 필터</SheetTitle>
          <SheetDescription hidden />
        </SheetHeader>
        <div className="flex flex-1 auto-rows-min flex-col gap-6">
          <div className={'flex flex-col gap-3'}>
            <Muted>태그를 선택해주세요: {selectedTags.length}</Muted>
            <div className={'scrollWidth3 flex max-h-[250px] flex-wrap gap-1 overflow-auto'}>
              {tags.map((tag) => {
                const selected = tempTags.includes(tag.name);
                return (
                  <Badge
                    key={'selectTag-' + tag.idx}
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
                      console.log(newSelectedTags);
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
          <div className={'flex flex-1 flex-col gap-3'}>
            <Muted>해당되는 채널리스트: {selectedChannels.length}</Muted>
            <div className={'scrollWidth3 relative flex h-full flex-1 overflow-auto'}>
              <div className={'absolute h-full w-full'}>
                <div className="flex h-full w-full flex-1 flex-col rounded-md border px-4">
                  {selectedChannels.map((channel) => (
                    <div className={'flex w-full items-center justify-between border-b py-2'}>
                      <span
                        className="flex flex-1 items-center gap-1 py-2 text-xs tabular-nums"
                        key={channel.channelId}
                      >
                        <Avatar className={'h-6 w-6'}>
                          <AvatarImage src={channel.icon} />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <p className={'font-bold'}>{channel.name}</p>
                      </span>
                      <div className={'flex max-w-[180px] gap-0.5 text-end'}>
                        {channel.tag.split(',')[0] === '' ? (
                          <Badge variant="destructive" key={'none'} size={'sm'}>
                            N/A
                          </Badge>
                        ) : (
                          channel.tag.split(',').map((tag, i) => (
                            <Badge variant="secondary" key={i} size={'sm'}>
                              {jsonData[tag]}
                            </Badge>
                          ))
                        )}
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
            variant={selectedTags.length !== tempTags.length ? 'destructive' : 'default'}
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
