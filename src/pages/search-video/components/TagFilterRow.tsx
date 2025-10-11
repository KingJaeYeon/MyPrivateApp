import { ChevronsUpDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import useTagStore from '@/store/tag';
import { useState } from 'react';
import { Label } from '@/components/ui/label.tsx';
import ButtonSwitcher from '@/components/ButtonSwitcher.tsx';

export function TagFilterRow() {
  // const { data: filter, set } = useFilterStore((s) => ({ data: s.data, set: s.set }));
  const tags = useTagStore((s) => s.data); // [{ idx, name, color? }, ...]
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState({
    tagLogic: 'AND', // 'AND' | 'OR'
    selectedTagIds: [] as number[],
  });

  const [tagLogic, setTagLogic] = useState<string>('AND');
  const set = (k: keyof typeof filter, v: any) => setFilter((s) => ({ ...s, [k]: v }));

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
    <div className="flex flex-wrap items-center gap-2">
      {/* 태그 필터 사용 스위치 */}
      <Label className="opacity-80">태그 필터</Label>
      {/* AND / OR */}

      <ButtonSwitcher
        state={tagLogic}
        setState={setTagLogic}
        size={'sm'}
        list={[
          { label: 'AND', value: 'AND' },
          { label: 'OR', value: 'OR' },
        ]}
      />

      {/* 태그 선택 팝오버 */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'ml-2 w-[260px] justify-between',
              // !filter.tagEnabled &&
              'pointer-events-none opacity-50'
            )}
          >
            {/*{selectedTags.length > 0 ? `${selectedTags.length}개 선택됨` : '태그 선택...'}*/}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="태그 검색..." className="h-9" />
            <CommandList>
              <CommandEmpty>결과 없음</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  key="__clear__"
                  onSelect={() => {
                    // set('selectedTagIds', []);
                    setOpen(false);
                  }}
                >
                  전체 해제
                </CommandItem>
                {tags.map((tag) => (
                  <CommandItem
                    key={tag.idx}
                    // onSelect={() => toggleTag(tag.idx)}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        // style={{ background: tag.color ?? '#888' }}
                      />
                      {tag.name}
                    </span>
                    <Check
                      className={cn(
                        'ml-auto'
                        // filter.selectedTagIds.includes(tag.idx) ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* 선택된 태그 뱃지 바 */}
      {/*{selectedTags.length > 0 && (*/}
      <div className="flex flex-wrap gap-2">
        {['test', 'test11'].map((t) => (
          <Badge
            key={t}
            variant="secondary"
            className="cursor-pointer"
            // onClick={() => toggleTag(t.idx)}
          >
            #{t} ✕
          </Badge>
        ))}
      </div>
      {/*)}*/}
    </div>
  );
}
